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

// Device-local reading progress. Stored in IndexedDB only. Never synced to
// remote. Kept as a standalone interface so it is clear at the type level that
// these fields are never pushed to Firestore or shared between users.
export interface BookLocalProgress {
  // Content-anchored reading position. Synced across devices; the active page
  // is re-derived locally from this anchor because page indices depend on
  // device-local layout (font size, columns, viewport, image aspect ratios).
  readingPosition?: ReadingPosition;
  readingPositionUpdatedAtIso?: string;

  // Device-local cache of the last active page for instant restore on the same
  // device/layout. NOT synced — derived from `readingPosition` on other devices.
  activePageIndex?: number;
}

/**
 * Storage paths for every version of a book's source file in Firebase Storage.
 *
 * `epub` is the canonical reading source — it is always required at the type
 * level. It may briefly hold an empty string for a brand-new local book that
 * has not yet been uploaded by the sync layer; once the push completes the
 * empty string is replaced with the real Storage path. The non-EPUB slots are
 * `null` for directly-imported EPUBs.
 */
export interface ConvertedFilesPathMap {
  epub: string;
  pdf: string | null;
  docx: string | null;
}

export const createEmptyConvertedFilesPathMap = (): ConvertedFilesPathMap => ({
  epub: '',
  pdf: null,
  docx: null,
});

export interface Book extends BookLocalProgress {
  id: string;
  paragraphs: BookParagraph[];
  title: string;
  subtitle: string;
  author: string;
  // In-memory EPUB blob. Only kept locally (IndexedDB) — never persisted to
  // Firestore. Hydrated from Storage on devices that don't have it locally
  // via the `convertedFiles.epub` path.
  epubFile?: File;
  chapters?: BookChapterNavigationItem[];
  imagesByHref?: Record<string, string>;
  imageAspectRatioByHref?: Record<string, number>;
  // ISO string of changes of core book data (paragraphs, title, subtitle, author). Should be updated on every change of these data.
  dataUpdatedAtIso?: string;

  highlights?: HighlightedText[];
  highlightsUpdatedAtIso?: string;

  // Sharing. ownerUserId is the creator; userIds holds additional collaborators
  // (not including the owner). Optional because local-only books predate sharing.
  ownerUserId?: string;
  userIds?: string[];
  // Maps userId → email for all known members (owner + collaborators).
  // Populated lazily when the owner first opens the Share modal.
  memberEmails?: Record<string, string>;

  // Pointers into Firebase Storage. `paragraphsBlobPath` is only set once the
  // book has been synced.
  paragraphsBlobPath?: string;

  // Storage paths for every available file version of the book. The `epub`
  // slot is the canonical reading source (was `originalFileBlobPath`).
  convertedFiles: ConvertedFilesPathMap;

  // Version of the EPUB parser that produced `paragraphs` / `chapters` /
  // `imagesByHref`. When this does not match the current EPUB_PARSER_VERSION
  // constant, the client re-imports the EPUB to pick up parser improvements.
  epubParserVersion?: number;
}

export interface HighlightedText {
  paragraphIndex: number;
  startIndex: number;
  endIndex: number;
  color: string;
  note?: string;
  // Which user created this highlight. Needed for shared books.
  userId?: string;
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
