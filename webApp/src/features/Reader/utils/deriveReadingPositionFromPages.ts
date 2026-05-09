import { PagedParagraph } from './splitParagraphsIntoPages';
import { ReadingPosition } from '../model/types';

export interface DeriveReadingPositionInput {
  pages: PagedParagraph[][];
  // 1-based active page index (the start of the current spread).
  activePageIndex: number;
  // Number of columns visible in the current layout.
  columns: 1 | 2;
}

/**
 * Derives a content-anchored ReadingPosition from the first visible word of
 * the current spread. Returns null when there is no resolvable first word
 * (empty pages, out-of-range index, or empty paragraph).
 */
export const deriveReadingPositionFromPages = ({
  pages,
  activePageIndex,
  columns,
}: DeriveReadingPositionInput): ReadingPosition | null => {
  if (pages.length === 0) return null;
  if (activePageIndex < 1 || activePageIndex > pages.length) return null;

  const page = pages[activePageIndex - 1];
  if (!page || page.length === 0) return null;

  const firstParagraph = page[0];
  const firstWord = firstParagraph.words[0];
  if (typeof firstWord !== 'string' || firstWord.length === 0) return null;

  return {
    paragraphIndex: firstParagraph.sourceParagraphIndex,
    wordStartCharOffset: firstParagraph.sourceStartCharOffset,
    wordKey: firstWord,
    lastKnownPageIndex: activePageIndex,
    lastKnownColumns: columns,
  };
};
