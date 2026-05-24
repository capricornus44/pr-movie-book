export class MovieEntity {
  id: string;
  title: string;
  year: number;
  genres: string[];
  rating: number;
  duration: number;
  director: string;

  constructor(partial: Partial<MovieEntity>) {
    Object.assign(this, partial);
  }
}
