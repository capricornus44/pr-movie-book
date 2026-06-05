import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateShowtimeDto {
  @ApiProperty({
    example: '66a1234b5678c9d0123ef456',
    description: 'Movie ID from MongoDB as a string',
  })
  @IsString()
  @IsNotEmpty()
  movieId: string;

  @ApiProperty({ example: 'f3b8f0a2-7c5e-4d91-a8f4-2e6d9b1c7a43' })
  @IsUUID()
  @IsNotEmpty()
  hallId: string;

  @ApiProperty({
    example: '12.50',
    description: 'Price, decimal',
  })
  @IsNumber()
  @IsPositive()
  price: string;

  @ApiProperty({ example: '2026-06-03T18:00:00.000Z' })
  @IsDateString()
  startTime: string;
}
