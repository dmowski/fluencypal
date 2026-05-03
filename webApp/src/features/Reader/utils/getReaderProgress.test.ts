import { getReaderProgress } from './getReaderProgress';

describe('getReaderProgress', () => {
  describe('single column layout', () => {
    it('returns activePage as currentPage and pageCount as totalPages', () => {
      const result = getReaderProgress({
        activePage: 3,
        pageCount: 10,
        isTwoColumnLayout: false,
      });

      expect(result.currentPage).toBe(3);
      expect(result.totalPages).toBe(10);
    });

    it('computes percentage based on activePage / pageCount', () => {
      const result = getReaderProgress({
        activePage: 5,
        pageCount: 10,
        isTwoColumnLayout: false,
      });

      expect(result.percentage).toBe(50);
    });

    it('rounds percentage to nearest integer', () => {
      const result = getReaderProgress({
        activePage: 1,
        pageCount: 3,
        isTwoColumnLayout: false,
      });

      expect(result.percentage).toBe(33);
    });

    it('returns 100% on last page', () => {
      const result = getReaderProgress({
        activePage: 10,
        pageCount: 10,
        isTwoColumnLayout: false,
      });

      expect(result.percentage).toBe(100);
    });

    it('returns 0% when pageCount is 0', () => {
      const result = getReaderProgress({
        activePage: 0,
        pageCount: 0,
        isTwoColumnLayout: false,
      });

      expect(result.percentage).toBe(0);
    });
  });

  describe('two column layout', () => {
    it('halves activePage and pageCount (even page count)', () => {
      const result = getReaderProgress({
        activePage: 1,
        pageCount: 6,
        isTwoColumnLayout: true,
      });

      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(3);
    });

    it('returns spread 2 for activePage 3', () => {
      const result = getReaderProgress({
        activePage: 3,
        pageCount: 6,
        isTwoColumnLayout: true,
      });

      expect(result.currentPage).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('returns spread 3 for activePage 5', () => {
      const result = getReaderProgress({
        activePage: 5,
        pageCount: 6,
        isTwoColumnLayout: true,
      });

      expect(result.currentPage).toBe(3);
      expect(result.totalPages).toBe(3);
    });

    it('rounds up totalPages for odd page count', () => {
      const result = getReaderProgress({
        activePage: 1,
        pageCount: 5,
        isTwoColumnLayout: true,
      });

      expect(result.totalPages).toBe(3);
    });

    it('computes percentage correctly for two columns', () => {
      const result = getReaderProgress({
        activePage: 3,
        pageCount: 6,
        isTwoColumnLayout: true,
      });

      // spread 2 of 3 = ~67%
      expect(result.percentage).toBe(67);
    });

    it('returns 100% on the last spread', () => {
      const result = getReaderProgress({
        activePage: 5,
        pageCount: 6,
        isTwoColumnLayout: true,
      });

      expect(result.percentage).toBe(100);
    });
  });
});
