import { PartialType } from '@nestjs/swagger';
import { CreateHallDto } from './create-hall.dto';

export class UpdateHallDto extends PartialType(CreateHallDto) {}
