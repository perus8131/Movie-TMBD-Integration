import { Request, Response } from 'express';
import { MovieService } from '../services/movieService';
import { ErrorMessages, ErrorType } from '../constants/errorContants';

export class MovieController {
  private movieService: MovieService;

  constructor() {
    this.movieService = new MovieService();
  }

  public getMoviesByYear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year } = req.params;
      const page = parseInt(req.query.page as string) || 1;

      if (!year.match(/^\d{4}$/)) {
        throw ErrorMessages.INVALID_YEAR_FORMAT;
      }

      if (page < 1) {
        throw ErrorMessages.INVALID_PAGE_NUMBER;
      }

      const result = await this.movieService.getMoviesByYear(year, page);
      res.json(result);
    } catch (error) {
      console.error('Error in getMoviesByYear:', error);

      let status = 500;
      let errorMessage = 'INTERNAL_SERVER_ERROR';

      switch (error) {
        case ErrorMessages.YEAR_REQUIRED:
        case ErrorMessages.INVALID_YEAR_FORMAT:
        case ErrorMessages.INVALID_PAGE_NUMBER:
        case ErrorMessages.INVALID_MOVIE_ID:
          status = 400;
          errorMessage = error;
          break;
        case ErrorMessages.API_RESPONSE_INVALID:
        case ErrorMessages.MOVIE_FETCH_FAILED:
          status = 502;
          errorMessage = error;
          break;
        default:
          break;
      }
      res.status(status).json({ 
        error: errorMessage
      });
    }
  };
}