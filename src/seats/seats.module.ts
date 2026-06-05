import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SeatsController],
  providers: [SeatsService, PrismaService],
  exports: [SeatsService],
})
export class SeatsModule {}
