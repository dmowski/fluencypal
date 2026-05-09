import { resolveReadingPositionToPage } from './resolveReadingPositionToPage';
import { PagedParagraph } from './splitParagraphsIntoPages';

const buildPage = (
  entries: Array<{ words: string[]; sourceParagraphIndex: number; sourceStartCharOffset: number }>,
): PagedParagraph[] =>
  entries.map((entry) => ({
    words: entry.words,
    sourceParagraphIndex: entry.sourceParagraphIndex,
    sourceStartCharOffset: entry.sourceStartCharOffset,
  }));

describe('resolveReadingPositionToPage', () => {
  const pages: PagedParagraph[][] = [
    buildPage([
      { words: ['Once', 'upon', 'a', 'time'], sourceParagraphIndex: 0, sourceStartCharOffset: 0 },
    ]),
    buildPage([
      { words: ['there', 'lived', 'a', 'cat'], sourceParagraphIndex: 1, sourceStartCharOffset: 0 },
    ]),
    buildPage([
      { words: ['who', 'liked', 'fish'], sourceParagraphIndex: 1, sourceStartCharOffset: 18 },
    ]),
  ];

  it('returns "exact" when the anchor and wordKey both match', () => {
    const result = resolveReadingPositionToPage({
      pages,
      position: {
        paragraphIndex: 1,
        wordStartCharOffset: 0,
        wordKey: 'there',
      },
    });

    expect(result).toEqual({ pageIndex: 2, status: 'exact' });
  });

  it('returns "fallback" when the anchor lands on a page but wordKey differs', () => {
    const result = resolveReadingPositionToPage({
      pages,
      position: {
        paragraphIndex: 1,
        wordStartCharOffset: 0,
        wordKey: 'NOT-THE-WORD',
      },
    });

    expect(result).toEqual({ pageIndex: 2, status: 'fallback' });
  });

  it('falls back to the first page containing the paragraph when offset is unknown', () => {
    const result = resolveReadingPositionToPage({
      pages,
      position: {
        paragraphIndex: 1,
        wordStartCharOffset: 9999,
        wordKey: 'there',
      },
    });

    expect(result).toEqual({ pageIndex: 2, status: 'fallback' });
  });

  it('clamps an out-of-range paragraph index down to the last paragraph', () => {
    const result = resolveReadingPositionToPage({
      pages,
      position: {
        paragraphIndex: 999,
        wordStartCharOffset: 0,
        wordKey: 'gone',
      },
    });

    expect(result?.status).toBe('fallback');
    expect(result?.pageIndex).toBe(2);
  });

  it('returns null for empty pages', () => {
    const result = resolveReadingPositionToPage({
      pages: [],
      position: { paragraphIndex: 0, wordStartCharOffset: 0, wordKey: 'x' },
    });

    expect(result).toBeNull();
  });

  it('treats absent wordKey as an exact match when offset resolves', () => {
    const result = resolveReadingPositionToPage({
      pages,
      position: {
        paragraphIndex: 0,
        wordStartCharOffset: 5,
        wordKey: '',
      },
    });

    expect(result).toEqual({ pageIndex: 1, status: 'exact' });
  });
});
