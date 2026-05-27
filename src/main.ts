import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exceptation.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes fields that are not present in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra fields are provided
      transform: true, // Automatically converts types (for example, strings to numbers)
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MovieBook API')
    .setDescription('The MovieBook API description')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 5000;

  await app.listen(port);
}
bootstrap().catch(console.error);
