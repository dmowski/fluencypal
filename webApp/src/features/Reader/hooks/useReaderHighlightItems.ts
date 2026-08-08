import { useMemo } from 'react';
import { HighlightedText, BookParagraph } from '../model/types';
import { ReaderHighlightItem } from '../components/ReaderHighlightsPopover';
import { splitIntoPages } from '../utils/splitParagraphsIntoPages';

const HIGHLIGHT_CONTEXT_CHARS = 36;

const stripMarkdownDecorators = (value: string) => value.replace(/[*_`~]/g, '');

const findTargetPageForHighlight = ({
  pages,
  highlight,
}: {
  pages: ReturnType<typeof splitIntoPages>;
  highlight: HighlightedText;
}): number | null => {
  const pageIndex = pages.findIndex((page) =>
    page.some((pagedParagraph) => {
      if (pagedParagraph.sourceParagraphIndex !== highlight.paragraphIndex) {
        return false;
      }

      const chunkStart = pagedParagraph.sourceStartCharOffset;
      const chunkEndInclusive = chunkStart + pagedParagraph.words.join(' ').length - 1;

      return highlight.startIndex <= chunkEndInclusive && highlight.endIndex >= chunkStart;
    }),
  );

  if (pageIndex >= 0) {
    return pageIndex + 1;
  }

  const paragraphFallbackPageIndex = pages.findIndex((page) =>
    page.some((pagedParagraph) => pagedParagraph.sourceParagraphIndex === highlight.paragraphIndex),
  );

  return paragraphFallbackPageIndex >= 0 ? paragraphFallbackPageIndex + 1 : null;
};

export const useReaderHighlightItems = ({
  highlights,
  paragraphs,
  pages,
}: {
  highlights: HighlightedText[];
  paragraphs: BookParagraph[];
  pages: ReturnType<typeof splitIntoPages>;
}): ReaderHighlightItem[] =>
  useMemo(() => {
    const sortedHighlights = [...highlights].sort((a, b) => {
      if (a.paragraphIndex !== b.paragraphIndex) {
        return a.paragraphIndex - b.paragraphIndex;
      }
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      return a.endIndex - b.endIndex;
    });

    return sortedHighlights
      .map((highlight, index) => {
        const paragraphWords = paragraphs[highlight.paragraphIndex] ?? [];
        const paragraphText = paragraphWords.join(' ');
        const paragraphLength = paragraphText.length;
        const safeStart = Math.max(0, Math.min(highlight.startIndex, paragraphLength));
        const safeEndInclusive =
          paragraphLength > 0
            ? Math.max(safeStart, Math.min(highlight.endIndex, paragraphLength - 1))
            : safeStart;
        const safeEndExclusive = Math.min(paragraphLength, safeEndInclusive + 1);
        const contextStart = Math.max(0, safeStart - HIGHLIGHT_CONTEXT_CHARS);
        const contextEnd = Math.min(paragraphLength, safeEndExclusive + HIGHLIGHT_CONTEXT_CHARS);

        const beforePrefix = contextStart > 0 ? '... ' : '';
        const afterSuffix = contextEnd < paragraphLength ? ' ...' : '';
        const beforeText = stripMarkdownDecorators(
          beforePrefix + paragraphText.slice(contextStart, safeStart),
        );
        const highlightedText = stripMarkdownDecorators(
          paragraphText.slice(safeStart, safeEndExclusive),
        );
        const afterText = stripMarkdownDecorators(
          paragraphText.slice(safeEndExclusive, contextEnd) + afterSuffix,
        );

        return {
          id: `${highlight.paragraphIndex}-${highlight.startIndex}-${highlight.endIndex}-${index}`,
          beforeText,
          highlightedText,
          afterText,
          color: highlight.color,
          targetPage: findTargetPageForHighlight({ pages, highlight }),
        };
      })
      .reverse();
  }, [highlights, paragraphs, pages]);
