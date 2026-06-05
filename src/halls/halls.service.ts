import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Hall } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@Injectable()
export class HallsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHallDto): Promise<Hall> {
    const existing = await this.prisma.hall.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Hall with name "${dto.name}" already exists`,
      );
    }

    return this.prisma.hall.create({ data: dto });
  }

  async findAll(): Promise<Hall[]> {
    return this.prisma.hall.findMany({
      include: { _count: { select: { seats: true, showtimes: true } } },
    });
  }

  async findOne(id: string): Promise<Hall> {
    const hall = await this.prisma.hall.findUnique({
      where: { id },
      include: { seats: true },
    });

    if (!hall) {
      throw new NotFoundException(`Hall with id ${id} not found`);
    }

    return hall;
  }

  async update(id: string, dto: UpdateHallDto): Promise<Hall> {
    await this.findOne(id);
    return this.prisma.hall.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.hall.delete({ where: { id } });
  }
}
