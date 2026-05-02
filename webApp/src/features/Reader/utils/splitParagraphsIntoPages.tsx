import { getHash } from '@/libs/hash';
import { splitWords } from '../../Sentence/TextConstructor/textConstructor.utils';
import { BookParagraph, ReaderUiSettings } from '../model/types';
import { isFitInPage } from './isFitInPage';

export interface SplitIntoPagesData {
  bookParagraphs: BookParagraph[];
  settings: ReaderUiSettings;
}

const splitIntoPagesCache = new Map<string, BookParagraph[][]>();

export const splitIntoPages = ({
  bookParagraphs,
  settings,
}: SplitIntoPagesData): BookParagraph[][] => {
  const hash = getHash(
    JSON.stringify({
      bookParagraphs,
      settings,
    }),
  );
  const cachedPages = splitIntoPagesCache.get(hash);

  if (cachedPages) {
    return cachedPages;
  }

  const pages: BookParagraph[][] = [];
  let currentPage: BookParagraph[] = [];
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

    const result = isFitInPage({ paragraphs, settings });
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

  bookParagraphs.forEach((paragraph) => {
    let remainingWords = paragraph;

    while (remainingWords.length > 0) {
      const fullParagraphText = remainingWords.join(' ');
      const fitsAsWhole = checkFits([...currentPageText, fullParagraphText]);

      if (fitsAsWhole) {
        currentPage.push(remainingWords);
        currentPageText.push(fullParagraphText);
        break;
      }

      const fittingPrefixLength = findFittingPrefixLength(remainingWords, currentPageText);
      if (fittingPrefixLength > 0) {
        const fittedWords = remainingWords.slice(0, fittingPrefixLength);

        currentPage.push(fittedWords);
        currentPageText.push(fittedWords.join(' '));
        pushCurrentPage();

        remainingWords = remainingWords.slice(fittingPrefixLength);
        continue;
      }

      if (currentPage.length > 0) {
        pushCurrentPage();
        continue;
      }

      const fallbackWords = remainingWords.slice(0, 1);
      const fittedWords = fallbackWords;

      currentPage.push(fittedWords);
      currentPageText.push(fittedWords.join(' '));
      pushCurrentPage();

      remainingWords = remainingWords.slice(1);
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
