import { getHash } from '@/libs/hash';
import { splitWords } from '../../Sentence/TextConstructor/textConstructor.utils';
import { BookParagraph, ReaderUiSettings } from '../model/types';

export interface SplitIntoPagesData extends ReaderUiSettings {
  bookParagraphs: BookParagraph[];
}

const splitIntoPagesCache = new Map<string, BookParagraph[][]>();

export const splitIntoPages = ({
  bookParagraphs,
  fontSize,
  lineHeight,
  contentWidth,
  contentHeight,
}: SplitIntoPagesData): BookParagraph[][] => {
  const hash = getHash(
    JSON.stringify({
      bookParagraphs,
      fontSize,
      lineHeight,
      contentWidth,
      contentHeight,
    }),
  );
  const cachedPages = splitIntoPagesCache.get(hash);

  if (cachedPages) {
    return cachedPages;
  }

  const pages: BookParagraph[][] = [];
  let currentPage: BookParagraph[] = [];
  let currentPageCharCount = 0;

  bookParagraphs.forEach((paragraph) => {
    if (currentPageCharCount + paragraph.length > 100) {
      pages.push(currentPage);
      currentPage = [];
      currentPageCharCount = 0;
    }
    currentPage.push(paragraph);
    currentPageCharCount += paragraph.length;
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
