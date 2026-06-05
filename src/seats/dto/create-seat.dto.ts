import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive } from 'class-validator';

export class CreateSeatDto {
  @ApiProperty({ example: 'A', description: 'Row label (A, B, C...)' })
  @IsString()
  row: string;

  @ApiProperty({ example: 1, description: 'Seat number within the row' })
  @IsInt()
  @IsPositive()
  number: number;
}
