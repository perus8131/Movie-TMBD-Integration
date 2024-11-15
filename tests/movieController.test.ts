import { MovieController } from '../src/controllers/movieController';
import { MovieService } from '../src/services/movieService';
import { Request, Response } from 'express';
import { ErrorMessages } from '../src/constants/errorContants';

jest.mock('../src/services/movieService');
console.error = jest.fn();

describe('MovieController', () => {
  let movieController: MovieController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let MockedMovieService: jest.MockedClass<typeof MovieService>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {}
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    MockedMovieService = MovieService as jest.MockedClass<typeof MovieService>;
    movieController = new MovieController();
    jest.clearAllMocks();
  });

  it('should handle valid request successfully', async () => {
    const mockResult = {
      movies: [{
        title: 'Test Movie',
        release_date: 'March 15, 2024',
        vote_average: 8.5,
        editors: ['Test Editor']
      }],
      pagination: {
        currentPage: 1,
        totalPages: 10,
        totalResults: 100
      }
    };

    MockedMovieService.prototype.getMoviesByYear.mockResolvedValueOnce(mockResult);
    mockRequest.params = { year: '2024' };
    mockRequest.query = { page: '1' };

    await movieController.getMoviesByYear(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(MockedMovieService.prototype.getMoviesByYear).toHaveBeenCalledWith('2024', 1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
  });

  it('should handle invalid year format', async () => {
    mockRequest.params = { year: '202' };

    await movieController.getMoviesByYear(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: ErrorMessages.INVALID_YEAR_FORMAT
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error in getMoviesByYear:',
      ErrorMessages.INVALID_YEAR_FORMAT
    );
  });

  it('should handle invalid page number', async () => {
    mockRequest.params = { year: '2024' };
    mockRequest.query = { page: '-1' };

    await movieController.getMoviesByYear(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: ErrorMessages.INVALID_PAGE_NUMBER
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error in getMoviesByYear:',
      ErrorMessages.INVALID_PAGE_NUMBER
    );
  });

  it('should handle API response invalid error', async () => {
    mockRequest.params = { year: '2024' };
    MockedMovieService.prototype.getMoviesByYear.mockRejectedValueOnce(
      ErrorMessages.API_RESPONSE_INVALID
    );

    await movieController.getMoviesByYear(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(502);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: ErrorMessages.API_RESPONSE_INVALID
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error in getMoviesByYear:',
      ErrorMessages.API_RESPONSE_INVALID
    );
  });

  it('should handle unknown error', async () => {
    mockRequest.params = { year: '2024' };
    MockedMovieService.prototype.getMoviesByYear.mockRejectedValueOnce(
      new Error('Unknown error')
    );

    await movieController.getMoviesByYear(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR'
    });
  });

  it('should handle default page number', async () => {
    const mockResult = {
      movies: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalResults: 0
      }
    };

    MockedMovieService.prototype.getMoviesByYear.mockResolvedValueOnce(mockResult);
    mockRequest.params = { year: '2024' };
    // Not setting query.page

    await movieController.getMoviesByYear(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(MockedMovieService.prototype.getMoviesByYear).toHaveBeenCalledWith('2024', 1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
  });
});