export type BookWord = string;
export type BookParagraph = BookWord[];

export interface Book {
  id: string;
  paragraphs: BookParagraph[];
  title: string;
  subtitle: string;
  category: string;
  highlights?: HighlightedText[];
  readProgress?: ReadingProgress;
  activePageIndex?: number;
}

export interface HighlightedText {
  paragraphIndex: number;
  startIndex: number;
  endIndex: number;
  color: string;
  note?: string;
}

export interface ReadingProgress {
  startIndex: number;
  endIndex: number;
}

export interface ReaderUiSettings {
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
  paragraphGap: number;
}
