import { deriveReadingPositionFromPages } from './deriveReadingPositionFromPages';
import { PagedParagraph } from './splitParagraphsIntoPages';

const buildPage = (
  entries: Array<{ words: string[]; sourceParagraphIndex: number; sourceStartCharOffset: number }>,
): PagedParagraph[] =>
  entries.map((entry) => ({
    words: entry.words,
    sourceParagraphIndex: entry.sourceParagraphIndex,
    sourceStartCharOffset: entry.sourceStartCharOffset,
  }));

describe('deriveReadingPositionFromPages', () => {
  it('returns the first visible word of the active page', () => {
    const pages: PagedParagraph[][] = [
      buildPage([{ words: ['Once', 'upon'], sourceParagraphIndex: 0, sourceStartCharOffset: 0 }]),
      buildPage([
        { words: ['a', 'time'], sourceParagraphIndex: 0, sourceStartCharOffset: 10 },
        { words: ['there', 'lived'], sourceParagraphIndex: 1, sourceStartCharOffset: 0 },
      ]),
    ];

    const position = deriveReadingPositionFromPages({
      pages,
      activePageIndex: 2,
      columns: 1,
    });

    expect(position).toEqual({
      paragraphIndex: 0,
      wordStartCharOffset: 10,
      wordKey: 'a',
      lastKnownPageIndex: 2,
      lastKnownColumns: 1,
    });
  });

  it('records the columns layout used at capture time', () => {
    const pages: PagedParagraph[][] = [
      buildPage([{ words: ['Hello'], sourceParagraphIndex: 3, sourceStartCharOffset: 5 }]),
    ];

    const position = deriveReadingPositionFromPages({
      pages,
      activePageIndex: 1,
      columns: 2,
    });

    expect(position?.lastKnownColumns).toBe(2);
  });

  it('returns null for empty pages', () => {
    expect(
      deriveReadingPositionFromPages({ pages: [], activePageIndex: 1, columns: 1 }),
    ).toBeNull();
  });

  it('returns null when the active page index is out of range', () => {
    const pages: PagedParagraph[][] = [
      buildPage([{ words: ['Hello'], sourceParagraphIndex: 0, sourceStartCharOffset: 0 }]),
    ];

    expect(deriveReadingPositionFromPages({ pages, activePageIndex: 0, columns: 1 })).toBeNull();
    expect(deriveReadingPositionFromPages({ pages, activePageIndex: 5, columns: 1 })).toBeNull();
  });

  it('returns null when the first paragraph on the page has no words', () => {
    const pages: PagedParagraph[][] = [
      buildPage([{ words: [], sourceParagraphIndex: 0, sourceStartCharOffset: 0 }]),
    ];

    expect(deriveReadingPositionFromPages({ pages, activePageIndex: 1, columns: 1 })).toBeNull();
  });
});
