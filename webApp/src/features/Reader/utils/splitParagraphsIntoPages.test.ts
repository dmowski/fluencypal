import { splitIntoPages } from './splitParagraphsIntoPages';
import { isFitInPage } from './isFitInPage';
import { ReaderSettings } from '../model/types';

jest.mock('./isFitInPage', () => ({
  isFitInPage: jest.fn(),
}));

const mockedIsFitInPage = isFitInPage as jest.MockedFunction<typeof isFitInPage>;

const settings: ReaderSettings = {
  language: 'en-US',
  selectedVoiceURI: null,
  translateToLanguage: null,
  fontSize: 36,
  lineHeight: 1.5,
  justifyText: true,
  translateOnHover: false,
  contentWidth: 1200,
  contentHeight: 500,
  paragraphGap: 20,
  columns: 1,
  columnGap: 40,
};

const countWords = (paragraphs: string[]) =>
  paragraphs.reduce((total, paragraph) => {
    const words = paragraph.trim().length === 0 ? [] : paragraph.trim().split(/\s+/);
    return total + words.length;
  }, 0);

describe('splitIntoPages', () => {
  beforeEach(() => {
    mockedIsFitInPage.mockReset();
  });

  it('splits first paragraph when it does not fit on an empty page', () => {
    mockedIsFitInPage.mockImplementation(({ paragraphs }) => countWords(paragraphs) <= 2);

    const result = splitIntoPages({
      bookParagraphs: [['a', 'b', 'c', 'd']],
      settings: { ...settings, contentHeight: 501 },
    });

    expect(result).toEqual([
      [
        {
          words: ['a', 'b'],
          sourceParagraphIndex: 0,
          sourceStartCharOffset: 0,
        },
      ],
      [
        {
          words: ['c', 'd'],
          sourceParagraphIndex: 0,
          sourceStartCharOffset: 4,
        },
      ],
    ]);
  });

  it('fills current page with a prefix of overflowing paragraph before moving remainder', () => {
    mockedIsFitInPage.mockImplementation(({ paragraphs }) => countWords(paragraphs) <= 3);

    const result = splitIntoPages({
      bookParagraphs: [
        ['one', 'two'],
        ['three', 'four', 'five'],
      ],
      settings: { ...settings, contentHeight: 502 },
    });

    expect(result).toEqual([
      [
        {
          words: ['one', 'two'],
          sourceParagraphIndex: 0,
          sourceStartCharOffset: 0,
        },
        {
          words: ['three'],
          sourceParagraphIndex: 1,
          sourceStartCharOffset: 0,
        },
      ],
      [
        {
          words: ['four', 'five'],
          sourceParagraphIndex: 1,
          sourceStartCharOffset: 6,
        },
      ],
    ]);
  });
});
