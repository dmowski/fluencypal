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

  // Content-anchored reading position. Synced across devices; the active page
  // is re-derived locally from this anchor because page indices depend on
  // device-local layout (font size, columns, viewport, image aspect ratios).
  readingPosition?: ReadingPosition;
  readingPositionUpdatedAtIso?: string;

  // Device-local cache of the last active page for instant restore on the same
  // device/layout. NOT synced — derived from `readingPosition` on other devices.
  activePageIndex?: number;
}

export interface HighlightedText {
  paragraphIndex: number;
  startIndex: number;
  endIndex: number;
  color: string;
  note?: string;
}

export interface ReadingPosition {
  // 0-based index into Book.paragraphs.
  paragraphIndex: number;
  // Char offset of the first visible word inside that paragraph.
  wordStartCharOffset: number;
  // Copy of the word text used to verify the anchor still resolves after
  // re-imports or pagination changes.
  wordKey: string;
  // Diagnostic only, not authoritative for restore.
  lastKnownPageIndex?: number;
  lastKnownColumns?: 1 | 2;
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
