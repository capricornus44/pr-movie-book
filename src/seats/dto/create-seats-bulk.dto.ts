import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSeatDto } from './create-seat.dto';

export class CreateSeatsBulkDto {
  @ApiProperty({ type: [CreateSeatDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSeatDto)
  seats: CreateSeatDto[];
}
