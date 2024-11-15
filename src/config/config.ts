import dotenv from 'dotenv';
dotenv.config();

export const config = {
  tmdbApiKey: process.env.TMDB_API_KEY,
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  port: process.env.PORT || 3000
};