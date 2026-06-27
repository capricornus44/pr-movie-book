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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '@prisma/client';

@ApiTags('showtimes')
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Create a new showtime (validates movie duration and checks overlapping)',
  })
  @ApiResponse({ status: 201, description: 'Showtime created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({
    status: 409,
    description: 'Time slot overlaps with an existing showtime',
  })
  create(@Body() createShowtimeDto: CreateShowtimeDto) {
    return this.showtimesService.create(createShowtimeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all showtimes' })
  findAll() {
    return this.showtimesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific showtime' })
  @ApiResponse({ status: 200, description: 'Showtime details' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  findOne(@Param('id') id: string) {
    return this.showtimesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a showtime' })
  @ApiResponse({ status: 200, description: 'Showtime updated successfully' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  @ApiResponse({
    status: 409,
    description: 'New time slot overlaps with another showtime',
  })
  update(
    @Param('id') id: string,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    return this.showtimesService.update(id, updateShowtimeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a showtime' })
  @ApiResponse({ status: 204, description: 'Showtime deleted' })
  @ApiResponse({ status: 404, description: 'Showtime not found' })
  remove(@Param('id') id: string) {
    return this.showtimesService.remove(id);
  }
}
