import { PagedParagraph } from './splitParagraphsIntoPages';

export interface ReaderWordAnchor {
  paragraphIndex: number;
  wordStartCharOffset: number;
}

export const findTargetPageForWordAnchor = ({
  pages,
  anchor,
}: {
  pages: PagedParagraph[][];
  anchor: ReaderWordAnchor;
}): number | null => {
  const pageIndex = pages.findIndex((page) =>
    page.some((pagedParagraph) => {
      if (pagedParagraph.sourceParagraphIndex !== anchor.paragraphIndex) {
        return false;
      }

      const chunkStart = pagedParagraph.sourceStartCharOffset;
      const chunkEndExclusive = chunkStart + pagedParagraph.words.join(' ').length;

      return (
        anchor.wordStartCharOffset >= chunkStart && anchor.wordStartCharOffset < chunkEndExclusive
      );
    }),
  );

  return pageIndex >= 0 ? pageIndex + 1 : null;
};
