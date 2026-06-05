import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HallsService } from './halls.service';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateHallDto } from './dto/update-hall.dto';

@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly hallsService: HallsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hall' })
  @ApiResponse({ status: 201, description: 'Hall created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Hall with this name already exists',
  })
  create(@Body() createHallDto: CreateHallDto) {
    return this.hallsService.create(createHallDto);
  }
  @Get()
  @ApiOperation({ summary: 'Get all halls' })
  @ApiResponse({
    status: 200,
    description: 'List of halls with seat and showtime counts',
  })
  findAll() {
    return this.hallsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hall by ID (includes seats)' })
  @ApiResponse({ status: 200, description: 'Hall found' })
  @ApiResponse({ status: 404, description: 'Hall not found' })
  findOne(@Param('id') id: string) {
    return this.hallsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hall' })
  @ApiResponse({ status: 200, description: 'Hall updated' })
  @ApiResponse({ status: 404, description: 'Hall not found' })
  update(@Param('id') id: string, @Body() updateHallDto: UpdateHallDto) {
    return this.hallsService.update(id, updateHallDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hall' })
  @ApiResponse({ status: 204, description: 'Hall deleted' })
  @ApiResponse({ status: 404, description: 'Hall not found' })
  remove(@Param('id') id: string) {
    return this.hallsService.remove(id);
  }
}
