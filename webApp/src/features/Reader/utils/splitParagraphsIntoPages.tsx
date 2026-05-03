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
}

const splitIntoPagesCache = new Map<string, PagedParagraph[][]>();

export const splitIntoPages = ({
  bookParagraphs,
  settings,
  imageAspectRatioByHref,
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

  bookParagraphs.forEach((paragraph, sourceParagraphIndex) => {
    let remainingWords = paragraph;
    let remainingStartCharOffset = 0;

    while (remainingWords.length > 0) {
      const fullParagraphText = remainingWords.join(' ');
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
  const paragraphs = text.split('\n').filter((p) => p.trim() !== '');
  return paragraphs.map((paragraph) => splitWords(paragraph));
};
