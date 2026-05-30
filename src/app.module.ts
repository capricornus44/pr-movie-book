import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const user = configService.get<string>('MONGO_USER');
        const pass = configService.get<string>('MONGO_PASSWORD');
        const dbName = configService.get<string>('MONGO_DB');
        const host = configService.get<string>('MONGO_HOST');
        const port = configService.get<string>('MONGO_PORT');

        const uri = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`;

        return { uri };
      },
    }),
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
