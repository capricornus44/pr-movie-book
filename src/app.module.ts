import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HallsModule } from './halls/halls.module';
import { SeatsModule } from './seats/seats.module';
import { ShowtimesModule } from './showtimes/showtimes.module';
import { BookingsModule } from './bookings/bookings.module';
import { MoviesModule } from './movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';

const myEnv = dotenv.config();
expand(myEnv);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_DATABASE_URL');

        return { uri };
      },
    }),
    PrismaModule,
    MoviesModule,
    HallsModule,
    SeatsModule,
    ShowtimesModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
