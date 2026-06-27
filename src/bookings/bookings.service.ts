import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto, userId: string) {
    // Prevent race conditions
    return this.prisma.$transaction(async (tx) => {
      const [showtime, seats] = await Promise.all([
        tx.showtime.findUnique({
          where: { id: dto.showtimeId },
          include: { hall: true },
        }),
        tx.seat.findMany({
          where: { id: { in: dto.seatIds } },
        }),
      ]);

      if (!showtime) {
        throw new NotFoundException(
          `Showtime with ID "${dto.showtimeId}" not found`,
        );
      }

      if (seats.length !== dto.seatIds.length) {
        throw new NotFoundException('One or more selected seats do not exist');
      }

      // Verify that all seats belong to the hall where the showtime takes place
      const foreignSeats = seats.filter(
        (seat) => seat.hallId !== showtime.hallId,
      );
      if (foreignSeats.length > 0) {
        throw new ConflictException(
          'Some selected seats do not belong to the showtime hall',
        );
      }

      // Find active bookings that contain any of the selected seats, excluding CANCELLED status
      const activeBookings = await tx.booking.findMany({
        where: {
          showtimeId: dto.showtimeId,
          status: { not: BookingStatus.CANCELLED },
          seats: {
            some: {
              id: { in: dto.seatIds },
            },
          },
        },
        include: { seats: true },
      });

      if (activeBookings.length > 0) {
        const bookedSeatIds = activeBookings
          .flatMap((b) => b.seats)
          .map((s) => s.id)
          .filter((id) => dto.seatIds.includes(id));

        throw new ConflictException(
          `Seats [${bookedSeatIds.join(', ')}] are already booked for this showtime`,
        );
      }
      const totalPrice = Number(showtime.price) * seats.length;

      return tx.booking.create({
        data: {
          userId,
          showtimeId: dto.showtimeId,
          totalPrice,
          status: BookingStatus.PENDING,
          seats: {
            connect: dto.seatIds.map((id) => ({ id })),
          },
        },
        include: {
          showtime: { include: { hall: true } },
          seats: true,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        showtime: { include: { hall: true } },
        seats: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        showtime: { include: { hall: true } },
        seats: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    return booking;
  }

  async cancel(id: string) {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException('Booking is already cancelled');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { seats: true },
    });
  }
}
