import { findTargetPageForWordAnchor } from './readerPageAnchor';
import { PagedParagraph } from './splitParagraphsIntoPages';
import { ReadingPosition } from '../model/types';

export type ReadingPositionResolutionStatus = 'exact' | 'fallback' | 'unresolved';

export interface ResolvedReadingPosition {
  // 1-based page index in the current `pages` layout.
  pageIndex: number;
  status: ReadingPositionResolutionStatus;
}

const findWordAtOffset = (pagedParagraph: PagedParagraph, targetOffset: number): string | null => {
  let offset = pagedParagraph.sourceStartCharOffset;
  for (const word of pagedParagraph.words) {
    if (offset === targetOffset) return word;
    if (offset > targetOffset) return null;
    offset += word.length + 1; // +1 for the joining space
  }
  return null;
};

/**
 * Resolves a content-anchored ReadingPosition to a page index in the current
 * pagination. Strategy:
 *   1. exact: the anchor word is inside one of the pages and `wordKey` matches
 *      (or no `wordKey` was provided).
 *   2. fallback: the anchor offset resolves but the word at it differs (e.g.
 *      after a re-import / pagination change), OR the offset doesn't resolve
 *      and we land on the first page containing the (clamped) paragraph index.
 *   3. unresolved: pages are empty.
 */
export const resolveReadingPositionToPage = ({
  pages,
  position,
}: {
  pages: PagedParagraph[][];
  position: ReadingPosition;
}): ResolvedReadingPosition | null => {
  if (pages.length === 0) return null;

  const exactPage = findTargetPageForWordAnchor({
    pages,
    anchor: {
      paragraphIndex: position.paragraphIndex,
      wordStartCharOffset: position.wordStartCharOffset,
    },
  });

  if (exactPage != null) {
    const pagedParagraph = pages[exactPage - 1].find(
      (paragraph) => paragraph.sourceParagraphIndex === position.paragraphIndex,
    );
    const wordAtOffset = pagedParagraph
      ? findWordAtOffset(pagedParagraph, position.wordStartCharOffset)
      : null;
    const wordKeyMatches = !position.wordKey || wordAtOffset === position.wordKey;
    return { pageIndex: exactPage, status: wordKeyMatches ? 'exact' : 'fallback' };
  }

  const maxParagraphIndex = pages.reduce((acc, page) => {
    page.forEach((paragraph) => {
      if (paragraph.sourceParagraphIndex > acc) acc = paragraph.sourceParagraphIndex;
    });
    return acc;
  }, 0);
  const clampedParagraphIndex = Math.min(Math.max(position.paragraphIndex, 0), maxParagraphIndex);
  const fallbackPage = pages.findIndex((page) =>
    page.some((paragraph) => paragraph.sourceParagraphIndex >= clampedParagraphIndex),
  );

  if (fallbackPage >= 0) {
    return { pageIndex: fallbackPage + 1, status: 'fallback' };
  }

  return { pageIndex: pages.length, status: 'fallback' };
};
