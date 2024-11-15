import axios, { AxiosError } from 'axios';
import { config } from '../config/config';
import { CrewMember, MovieResponse, TMDBDiscoverResponse, TMDBMovieCredit } from '../types/movie';
import { formatDate } from '../helpers/dateHelper';
import { ErrorMessages, ErrorType } from '../constants/errorContants';

export class MovieService {
  private readonly baseUrl: string;
  private readonly headers: { Authorization: string };

  constructor() {
    this.baseUrl = config.tmdbBaseUrl;
    this.headers = {
      Authorization: `Bearer ${config.tmdbApiKey}`
    };
  }

  private async fetchMovies(year: string, page: number = 1): Promise<TMDBDiscoverResponse> {
    try {
      if (!year) {
        throw ErrorMessages.YEAR_REQUIRED;
      }

      if (!year.match(/^\d{4}$/)) {
        throw ErrorMessages.INVALID_YEAR_FORMAT;
      }

      const response = await axios.get<TMDBDiscoverResponse>(
        `${this.baseUrl}/discover/movie`,
        {
          headers: this.headers,
          params: {
            language: 'en-US',
            page: Math.max(1, page),
            primary_release_year: year,
            sort_by: 'popularity.desc'
          }
        }
      );

      if (!response?.data) {
        throw ErrorMessages.API_RESPONSE_INVALID;
      }

      return response.data;
    } catch (error) {
      if (Object.values(ErrorMessages).includes(error as ErrorType)) {
        throw error;
      }
      throw ErrorMessages.MOVIE_FETCH_FAILED;
    }
  }

  private async fetchMovieCredits(movieId: number): Promise<string[]> {
    try {
      if (!movieId) {
        throw ErrorMessages.MOVIE_ID_REQUIRED;
      }

      const response = await axios.get<TMDBMovieCredit>(
        `${this.baseUrl}/movie/${movieId}/credits`,
        { headers: this.headers }
      );

      if (!response?.data?.crew) {
        return []
      }

      return response.data.crew
        .filter((crewMember: CrewMember) => 
            crewMember?.known_for_department === 'Editing')
        .map((editor: CrewMember) => editor.name);
    } catch (error) {
      if (Object.values(ErrorMessages).includes(error as ErrorType)) {
        throw error;
      }
      return [];
    }
  }

  public async getMoviesByYear(year: string, page: number = 1): Promise<{
    movies: MovieResponse[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
    }
  }> {
    try {
      const moviesResponse = await this.fetchMovies(year, page);
      
      const moviesWithEditors = await Promise.all(
        moviesResponse.results.map(async movie => {
          const editors = await this.fetchMovieCredits(movie.id);
          
          return {
            title: movie.title,
            release_date: formatDate(movie.release_date),
            vote_average: movie.vote_average,
            editors
          };
        })
      );

      return {
        movies: moviesWithEditors,
        pagination: {
          currentPage: moviesResponse.page,
          totalPages: moviesResponse.total_pages,
          totalResults: moviesResponse.total_results
        }
      };
    } catch (error) {
      throw error;
    }
  }

}