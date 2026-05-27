import { ApiProperty } from '@nestjs/swagger';

export class MovieEntity {
  @ApiProperty({ example: 'b62283de-a8ba-4672-881c-cb880e66050b' })
  id: string;

  @ApiProperty({ example: 'The Matrix' })
  title: string;

  @ApiProperty({ example: 2020 })
  year: number;

  @ApiProperty({ example: ['Action', 'Sci-Fi'] })
  genres: string[];

  @ApiProperty({ example: 8.5 })
  rating: number;

  @ApiProperty({ example: 120 })
  duration: number;

  @ApiProperty({ example: 'Lana Wachowski' })
  director: string;

  constructor(partial: Partial<MovieEntity>) {
    Object.assign(this, partial);
  }
}
