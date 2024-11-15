import { MovieService } from '../src/services/movieService';
import axios from 'axios';
import { ErrorMessages } from '../src/constants/errorContants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MovieService', () => {
  let movieService: MovieService;

  beforeEach(() => {
    movieService = new MovieService();
    jest.clearAllMocks();
  });

  describe('fetchMovies', () => {
    it('should throw YEAR_REQUIRED error when year is empty', async () => {
      await expect(movieService['fetchMovies']('')).rejects.toBe(
        ErrorMessages.YEAR_REQUIRED
      );
    });

    it('should throw INVALID_YEAR_FORMAT error for invalid year format', async () => {
      await expect(movieService['fetchMovies']('202')).rejects.toBe(
        ErrorMessages.INVALID_YEAR_FORMAT
      );
    });

    it('should handle API response error', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });
      await expect(movieService['fetchMovies']('2024')).rejects.toBe(
        ErrorMessages.API_RESPONSE_INVALID
      );
    });

    it('should handle network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      await expect(movieService['fetchMovies']('2024')).rejects.toBe(
        ErrorMessages.MOVIE_FETCH_FAILED
      );
    });
  });

  describe('fetchMovieCredits', () => {
    it('should handle empty movie ID', async () => {
      await expect(movieService['fetchMovieCredits'](0)).rejects.toBe(
        ErrorMessages.MOVIE_ID_REQUIRED
      );
    });

    it('should handle missing crew data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      const result = await movieService['fetchMovieCredits'](1);
      expect(result).toEqual([]);
    });

    it('should filter editing crew members', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          crew: [
            { known_for_department: 'Editing', name: 'Editor 1' },
            { known_for_department: 'Direction', name: 'Director 1' },
            { known_for_department: 'Editing', name: 'Editor 2' }
          ]
        }
      });
      const result = await movieService['fetchMovieCredits'](1);
      expect(result).toEqual(['Editor 1', 'Editor 2']);
    });
  });

  describe('getMoviesByYear', () => {
    const mockMoviesResponse = {
      data: {
        page: 1,
        total_pages: 10,
        total_results: 100,
        results: [
          {
            id: 1,
            title: 'Test Movie',
            release_date: '2024-03-15',
            vote_average: 8.5
          }
        ]
      }
    };

    it('should return formatted movie data with editors', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockMoviesResponse)
        .mockResolvedValueOnce({
          data: {
            crew: [{ known_for_department: 'Editing', name: 'Test Editor' }]
          }
        });

      const result = await movieService.getMoviesByYear('2024');
      expect(result).toEqual({
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
      });
    });
  });
});
