import { Module } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { ShowtimesController } from './showtimes.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MoviesModule } from '../movies/movies.module';

@Module({
  controllers: [ShowtimesController],
  providers: [ShowtimesService, PrismaService],
  imports: [MoviesModule],
  exports: [ShowtimesService],
})
export class ShowtimesModule {}
