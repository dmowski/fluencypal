export const BOOK_TITLE = 'The Great Gatsby';
export const BOOK_SUBTITLE = 'Then wear the gold hat, if that will move her';

export type SpokenWindow = typeof window & {
  __spokenTexts?: string[];
  __speechCancelCount?: number;
};
