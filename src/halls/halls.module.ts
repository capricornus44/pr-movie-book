import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { HallsController } from './halls.controller';
import { HallsService } from './halls.service';

@Module({
  controllers: [HallsController],
  providers: [HallsService, PrismaService],
  exports: [HallsService],
})
export class HallsModule {}
