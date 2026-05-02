export type BookWord = string;
export type BookParagraph = BookWord[];

export interface Book {
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
