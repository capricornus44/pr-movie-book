import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength, IsPositive } from 'class-validator';

export class CreateHallDto {
  @ApiProperty({ example: 'IMAX Hall' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 120,
    description: 'Total number of seats in the hall',
  })
  @IsInt()
  @IsPositive()
  capacity: number;
}
