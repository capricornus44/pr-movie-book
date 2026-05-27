import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieEntity } from './entities/movie.entity';

@Injectable()
export class MoviesService {
  // In-memory store — temporary replacement for the database
  private movies: MovieEntity[] = [];

  create(createMovieDto: CreateMovieDto): MovieEntity {
    const movie = new MovieEntity({
      id: randomUUID(),
      ...createMovieDto,
    });
    this.movies.push(movie);

    return movie;
  }

  findAll(): MovieEntity[] {
    return this.movies;
  }

  findOne(id: string): MovieEntity {
    const movie = this.movies.find((movie) => movie.id === id);

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  update(id: string, updateMovieDto: UpdateMovieDto): MovieEntity {
    const movie = this.findOne(id);
    Object.assign(movie, updateMovieDto);

    return movie;
  }

  remove(id: string): void {
    this.findOne(id);
    this.movies = this.movies.filter((m) => m.id !== id);
  }
}
