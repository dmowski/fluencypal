import { getHash } from '@/libs/hash';
import { splitWords } from '../../Sentence/TextConstructor/textConstructor.utils';
import { BookParagraph, ReaderSettings } from '../model/types';
import { isFitInPage } from './isFitInPage';

export interface PagedParagraph {
  words: BookParagraph;
  sourceParagraphIndex: number;
  sourceStartCharOffset: number;
}

export interface SplitIntoPagesData {
  bookParagraphs: BookParagraph[];
  settings: ReaderSettings;
  imageAspectRatioByHref?: Record<string, number>;
  chapterStartParagraphIndices?: number[];
}

const splitIntoPagesCache = new Map<string, PagedParagraph[][]>();

export const splitIntoPages = ({
  bookParagraphs,
  settings,
  imageAspectRatioByHref,
  chapterStartParagraphIndices,
}: SplitIntoPagesData): PagedParagraph[][] => {
  const hash = getHash(
    JSON.stringify({
      bookParagraphs,
      settings,
      imageAspectRatioByHref,
    }),
  );
  const cachedPages = splitIntoPagesCache.get(hash);

  if (cachedPages) {
    return cachedPages;
  }
  const pages: PagedParagraph[][] = [];
  let currentPage: PagedParagraph[] = [];
  let currentPageText: string[] = [];
  const fitCache = new Map<string, boolean>();
  const chapterStartParagraphSet = new Set(chapterStartParagraphIndices ?? []);

  const resetCurrentPage = () => {
    currentPage = [];
    currentPageText = [];
  };

  const pushCurrentPage = () => {
    if (currentPage.length === 0) {
      return;
    }

    pages.push(currentPage);
    resetCurrentPage();
  };

  const checkFits = (paragraphs: string[]): boolean => {
    const fitKey = `${hash}-${getHash(JSON.stringify(paragraphs))}`;
    const cachedFit = fitCache.get(fitKey);
    if (typeof cachedFit === 'boolean') {
      return cachedFit;
    }

    const result = isFitInPage({
      paragraphs,
      settings,
      imageAspectRatioByHref,
    });
    fitCache.set(fitKey, result);
    return result;
  };

  const findFittingPrefixLength = (words: string[], pageText: string[]): number => {
    if (words.length === 0) {
      return 0;
    }

    let left = 1;
    let right = words.length;
    let best = 0;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      const candidateParagraph = words.slice(0, middle).join(' ');
      const fits = checkFits([...pageText, candidateParagraph]);

      if (fits) {
        best = middle;
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }

    return best;
  };

  const markdownImagePattern = /!\[.*?\]\(.*?\)/;

  bookParagraphs.forEach((paragraph, sourceParagraphIndex) => {
    if (sourceParagraphIndex > 0 && chapterStartParagraphSet.has(sourceParagraphIndex)) {
      pushCurrentPage();
    }

    let remainingWords = paragraph;
    let remainingStartCharOffset = 0;

    while (remainingWords.length > 0) {
      const fullParagraphText = remainingWords.join(' ');
      const containsImage = markdownImagePattern.test(fullParagraphText);
      const fitsAsWhole = checkFits([...currentPageText, fullParagraphText]);

      if (fitsAsWhole) {
        currentPage.push({
          words: remainingWords,
          sourceParagraphIndex,
          sourceStartCharOffset: remainingStartCharOffset,
        });
        currentPageText.push(fullParagraphText);
        break;
      }

      // Image paragraphs must not be split — flush current page and place whole on next.
      if (containsImage) {
        if (currentPage.length > 0) {
          pushCurrentPage();
          continue;
        }
        // Already on empty page — force the whole image paragraph as-is.
        currentPage.push({
          words: remainingWords,
          sourceParagraphIndex,
          sourceStartCharOffset: remainingStartCharOffset,
        });
        currentPageText.push(fullParagraphText);
        pushCurrentPage();
        break;
      }

      const fittingPrefixLength = findFittingPrefixLength(remainingWords, currentPageText);
      if (fittingPrefixLength > 0) {
        const fittedWords = remainingWords.slice(0, fittingPrefixLength);
        const fittedParagraphText = fittedWords.join(' ');

        currentPage.push({
          words: fittedWords,
          sourceParagraphIndex,
          sourceStartCharOffset: remainingStartCharOffset,
        });
        currentPageText.push(fittedParagraphText);
        pushCurrentPage();

        remainingWords = remainingWords.slice(fittingPrefixLength);
        remainingStartCharOffset += fittedParagraphText.length;
        if (remainingWords.length > 0) {
          remainingStartCharOffset += 1;
        }
        continue;
      }

      if (currentPage.length > 0) {
        pushCurrentPage();
        continue;
      }

      const fallbackWords = remainingWords.slice(0, 1);
      const fittedWords = fallbackWords;
      const fittedParagraphText = fittedWords.join(' ');

      currentPage.push({
        words: fittedWords,
        sourceParagraphIndex,
        sourceStartCharOffset: remainingStartCharOffset,
      });
      currentPageText.push(fittedParagraphText);
      pushCurrentPage();

      remainingWords = remainingWords.slice(1);
      remainingStartCharOffset += fittedParagraphText.length;
      if (remainingWords.length > 0) {
        remainingStartCharOffset += 1;
      }
    }
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  splitIntoPagesCache.set(hash, pages);

  return pages;
};

export const splitTextIntoParagraphs = (text: string): string[][] => {
  const normalizedText = text
    // Repair links where wrapped EPUB markdown inserts a newline inside link label.
    .replace(/(\[[^\]\n]*)\n([^\]\n]*\]\([^\)\n]*\))/g, '$1 $2')
    // Repair links where ] and ( are split across lines.
    .replace(/\]\s*\n\s*\(/g, '](')
    // Strip hidden/system identifiers that can leak from EPUB conversion.
    .replace(/^\s*_\d{6,}_\s*$/gm, '')
    .replace(/^\s*ep_prh_[\w.-]+\s*$/gim, '');

  const paragraphs = normalizedText.split('\n').filter((p) => p.trim() !== '');

  const markdownSpecialTokenPattern = /!\[[^\]]*\]\([^)]*\)|\[[^\]]+\]\([^)]*\)/g;

  return paragraphs.map((paragraph) => {
    const tokens: string[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;

    markdownSpecialTokenPattern.lastIndex = 0;
    while ((match = markdownSpecialTokenPattern.exec(paragraph)) !== null) {
      const imageStart = match.index;
      const imageEnd = imageStart + match[0].length;

      const beforeImage = paragraph.slice(cursor, imageStart);
      if (beforeImage.trim()) {
        tokens.push(...splitWords(beforeImage));
      }

      tokens.push(match[0]);
      cursor = imageEnd;
    }

    const tail = paragraph.slice(cursor);
    if (tail.trim()) {
      tokens.push(...splitWords(tail));
    }

    return tokens;
  });
};
