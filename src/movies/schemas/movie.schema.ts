import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true })
export class Movie {
  @ApiProperty({ example: 'The Matrix' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 2020 })
  @Prop({ required: true })
  year: number;

  @ApiProperty({ example: ['Action', 'Sci-Fi'] })
  @Prop([String])
  genres: string[];

  @ApiProperty({ example: 8.5 })
  @Prop({ default: 0 })
  rating: number;

  @ApiProperty({ example: 120 })
  @Prop()
  duration: number;

  @ApiProperty({ example: 'Lana Wachowski' })
  @Prop()
  director: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
