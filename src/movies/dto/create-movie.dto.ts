import {
  ArrayMinSize,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { MAX_RATING, MIN_RATING } from '../constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty({ example: ['Action', 'Sci-Fi'] })
  @IsString({ each: true })
  @ArrayMinSize(1)
  genres: string[];

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  rating: number;

  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 'Lana Wachowski' })
  @IsString()
  @IsNotEmpty()
  director: string;
}
