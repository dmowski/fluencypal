import { splitWords } from '../Sentence/TextConstructor/textConstructor.utils';

export const splitParagraphsIntoPages = (
  paragraphs: string[],
  pageSizeChars: number,
): string[][] => {
  const [firstParagraph, ...restParagraphs] = paragraphs;

  const pages: string[][] = [firstParagraph ? [firstParagraph] : []];
  let currentPage: string[] = pages[0];
  let currentPageCharCount = firstParagraph ? firstParagraph.length : 0;

  restParagraphs.forEach((paragraph) => {
    if (currentPageCharCount + paragraph.length > pageSizeChars) {
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

  return pages;
};

export const splitTextIntoParagraphs = (text: string): string[][] => {
  const paragraphs = text.split('\n').filter((p) => p.trim() !== '');
  return paragraphs.map((paragraph) => splitWords(paragraph));
};
