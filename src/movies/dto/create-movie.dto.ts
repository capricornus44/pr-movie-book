import {
  ArrayMinSize,
  IsAlpha,
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
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsInt()
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty()
  @IsAlpha()
  @IsString({ each: true })
  @ArrayMinSize(1)
  genres: string[];

  @ApiProperty()
  @IsNumber()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  rating: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  director: string;
}
