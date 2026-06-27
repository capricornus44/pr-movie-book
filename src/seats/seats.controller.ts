import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SeatsService } from './seats.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { CreateSeatsBulkDto } from './dto/create-seats-bulk.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '@prisma/client';

@ApiTags('seats')
@Controller('halls/:hallId/seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a single seat to a hall' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 201, description: 'Seat created' })
  @ApiResponse({ status: 404, description: 'Hall not found' })
  @ApiResponse({ status: 409, description: 'Seat already exists' })
  create(@Param('hallId') hallId: string, @Body() dto: CreateSeatDto) {
    return this.seatsService.create(hallId, dto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add multiple seats to a hall at once' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 201, description: 'Seats created, returns count' })
  @ApiResponse({ status: 404, description: 'Hall not found' })
  createBulk(@Param('hallId') hallId: string, @Body() dto: CreateSeatsBulkDto) {
    return this.seatsService.createBulk(hallId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all seats in a hall' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({
    status: 200,
    description: 'List of seats ordered by row and number',
  })
  findAll(@Param('hallId') hallId: string) {
    return this.seatsService.findByHall(hallId);
  }

  @Delete(':seatId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a seat from a hall' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiParam({ name: 'seatId', description: 'Seat ID' })
  @ApiResponse({ status: 204, description: 'Seat removed' })
  @ApiResponse({ status: 404, description: 'Seat or hall not found' })
  remove(@Param('hallId') hallId: string, @Param('seatId') seatId: string) {
    return this.seatsService.remove(hallId, seatId);
  }
}
