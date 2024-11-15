import { formatDate } from '../src/helpers/dateHelper';

describe('DateHelper', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      expect(formatDate('2024-03-15')).toBe('March 15, 2024');
      expect(formatDate('2023-12-31')).toBe('December 31, 2023');
    });

    it('should handle single digit days and months', () => {
      expect(formatDate('2024-01-05')).toBe('January 5, 2024');
    });
  });
});