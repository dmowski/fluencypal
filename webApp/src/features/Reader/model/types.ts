import { NativeLangCode } from '@/libs/language/type';
export type { NativeLangCode };

export type BookWord = string;
export type BookParagraph = BookWord[];

export interface BookChapterNavigationItem {
  id: string;
  label: string;
  href?: string;
  targetParagraphIndex: number | null;
  children: BookChapterNavigationItem[];
}

export interface Book {
  id: string;
  paragraphs: BookParagraph[];
  title: string;
  subtitle: string;
  author: string;
  originalFile?: File;
  chapters?: BookChapterNavigationItem[];
  imagesByHref?: Record<string, string>;
  imageAspectRatioByHref?: Record<string, number>;
  // ISO string of changes of core book data (paragraphs, title, subtitle, author). Should be updated on every change of these data.
  dataUpdatedAtIso?: string;

  highlights?: HighlightedText[];
  highlightsUpdatedAtIso?: string;

  readProgress?: ReadingProgress;
  readProgressUpdatedAtIso?: string;

  activePageIndex?: number;
  activePageIndexUpdatedAtIso?: string;
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

export interface ReaderSettings {
  language: string;
  selectedVoiceURI: string | null;
  translateToLanguage: NativeLangCode | null;
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
  paragraphGap: number;
  justifyText: boolean;
  translateOnHover: boolean;
  voiceOverSelectedText: boolean;
  columns: 1 | 2;
  columnGap: number;

  updatedAtIso?: string;
}

export interface ReaderResizeWordAnchor {
  paragraphIndex: number;
  wordStartCharOffset: number;
  key: string;
}
