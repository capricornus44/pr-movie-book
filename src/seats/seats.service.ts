import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { CreateSeatsBulkDto } from './dto/create-seats-bulk.dto';
import { Seat, Prisma } from '@prisma/client';

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hallId: string, dto: CreateSeatDto): Promise<Seat> {
    await this.ensureHallExists(hallId);

    try {
      const data: Prisma.SeatUncheckedCreateInput = {
        hallId,
        row: dto.row,
        number: dto.number,
      };
      return await this.prisma.seat.create({ data });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          `Seat "${dto.row}-${dto.number}" already exists in this hall`,
        );
      }
      throw e;
    }
  }

  async createBulk(
    hallId: string,
    dto: CreateSeatsBulkDto,
  ): Promise<{ count: number }> {
    await this.ensureHallExists(hallId);

    const data: Prisma.SeatUncheckedCreateInput[] = dto.seats.map((seat) => ({
      hallId,
      row: seat.row,
      number: seat.number,
    }));

    const result = await this.prisma.seat.createMany({
      data,
      skipDuplicates: true,
    });

    return { count: result.count };
  }

  async findByHall(hallId: string): Promise<Seat[]> {
    await this.ensureHallExists(hallId);

    return this.prisma.seat.findMany({
      where: { hallId },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    });
  }

  async remove(hallId: string, seatId: string): Promise<void> {
    const seat = await this.prisma.seat.findFirst({
      where: { id: seatId, hallId },
    });

    if (!seat) {
      throw new NotFoundException(`Seat "${seatId}" not found in this hall`);
    }
    await this.prisma.seat.delete({ where: { id: seatId } });
  }

  private async ensureHallExists(hallId: string): Promise<void> {
    const hall = await this.prisma.hall.findUnique({ where: { id: hallId } });

    if (!hall) {
      throw new NotFoundException(`Hall with id "${hallId}" not found`);
    }
  }
}
