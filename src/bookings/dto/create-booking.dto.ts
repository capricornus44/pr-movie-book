import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'b62283de-a8ba-4672-881c-cb880e66050b',
    description: 'Showtime UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  showtimeId: string;

  @ApiProperty({
    example: [
      'c72283de-a8ba-4672-881c-cb880e66050c',
      'd82283de-a8ba-4672-881c-cb880e66050d',
    ],
    description: 'Array of Seat UUIDs',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1)
  seatIds: string[];

  @ApiProperty({
    example: 'a12283de-a8ba-4672-881c-cb880e66050a',
    description:
      'User UUID (mocked for now until authentication is implemented)',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
