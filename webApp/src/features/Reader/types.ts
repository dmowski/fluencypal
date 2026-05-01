export interface ReaderData {
  title: string;
  subtitle: string;
  category: string; // ex: Story

  content: string;
}

export type BookWord = string;
export type BookParagraph = BookWord[];

export interface Book {
  paragraphs: BookParagraph[];
  title: string;
  subtitle: string;
  category: string;
}

export interface HighlightedText {
  startIndex: number;
  endIndex: number;
  color: string;
  note: string;
}

export interface ReadingProgress {
  startIndex: number;
  endIndex: number;
}

export interface BookState {
  highlights: HighlightedText[];
  readProgress: ReadingProgress;
}
