import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
  ApiBearerAuth,
} from '@nestjs/swagger';

import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './schemas/movie.schema';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/auth.guards';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '@prisma/client';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({
    status: 201,
    description: 'Movie created successfully',
    type: Movie,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({
    status: 200,
    description: 'List of all movies',
    type: [Movie],
  })
  async findAll(): Promise<Movie[]> {
    return this.moviesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie found',
    type: Movie,
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found',
  })
  async findOne(@Param('id') id: string): Promise<Movie> {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a movie by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie updated successfully',
    type: Movie,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 404,
    description: 'Movie not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a movie by ID' })
  @ApiResponse({
    status: 204,
    description: 'Movie deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.moviesService.remove(id);
  }
}
