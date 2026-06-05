import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MoviesService } from '../movies/movies.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Injectable()
export class ShowtimesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moviesService: MoviesService,
  ) {}

  async create(dto: CreateShowtimeDto) {
    const hall = await this.prisma.hall.findUnique({
      where: { id: dto.hallId },
    });
    if (!hall) {
      throw new NotFoundException(`Hall with ID "${dto.hallId}" not found`);
    }

    const movie = await this.moviesService.findOne(dto.movieId);
    if (!movie) {
      throw new NotFoundException(
        `Movie with ID "${dto.movieId}" not found in MongoDB`,
      );
    }

    const start = new Date(dto.startTime);
    const end = new Date(start.getTime() + movie.duration * 60 * 1000);

    await this.checkOverlapping(dto.hallId, start, end);

    return this.prisma.showtime.create({
      data: {
        movieId: dto.movieId,
        hallId: dto.hallId,
        startTime: start,
        endTime: end,
        price: dto.price,
      },
      include: { hall: true },
    });
  }

  async findAll() {
    return this.prisma.showtime.findMany({
      include: { hall: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id },
      include: { hall: true },
    });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID "${id}" not found`);
    }
    return showtime;
  }

  async update(id: string, dto: UpdateShowtimeDto) {
    const showtime = await this.findOne(id);

    let start = showtime.startTime;
    let end = showtime.endTime;
    const hallId = dto.hallId || showtime.hallId;

    if (dto.startTime || dto.movieId) {
      const movieId = dto.movieId || showtime.movieId;
      const movie = await this.moviesService.findOne(movieId);
      if (!movie) {
        throw new NotFoundException(`Movie with ID "${movieId}" not found`);
      }

      start = dto.startTime ? new Date(dto.startTime) : showtime.startTime;
      end = new Date(start.getTime() + movie.duration * 60 * 1000);

      await this.checkOverlapping(hallId, start, end, id);
    }

    return this.prisma.showtime.update({
      where: { id },
      data: {
        movieId: dto.movieId,
        hallId: dto.hallId,
        startTime: dto.startTime ? start : undefined,
        endTime: dto.startTime || dto.movieId ? end : undefined,
        price: dto.price,
      },
      include: { hall: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.showtime.delete({
      where: { id },
    });
  }

  private async checkOverlapping(
    hallId: string,
    start: Date,
    end: Date,
    excludeShowtimeId?: string,
  ): Promise<void> {
    const overlapping = await this.prisma.showtime.findFirst({
      where: {
        hallId,
        // Exclude the current showtime when updating
        id: excludeShowtimeId ? { not: excludeShowtimeId } : undefined,
        OR: [
          // A new showtime starts within an existing one
          { startTime: { lte: start }, endTime: { gte: start } },
          // A new showtime ends within an existing one
          { startTime: { lte: end }, endTime: { gte: end } },
          // The new showtime completely overlaps an existing one
          { startTime: { lte: start }, endTime: { gte: end } },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException(
        `Time slot overlaps with an existing showtime in this hall (ID: ${overlapping.id})`,
      );
    }
  }
}
