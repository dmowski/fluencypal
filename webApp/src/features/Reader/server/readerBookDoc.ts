import {
  BookChapterNavigationItem,
  HighlightedText,
  ReadingPosition,
} from '../model/types';

/**
 * Firestore document shape stored at `users/{uid}/readerBooks/{bookId}`.
 *
 * Heavy/static data (paragraphs, original EPUB file, images) is NOT stored
 * here. Those are uploaded to Firebase Storage at
 * `users/{uid}/reader/{bookId}/...` and referenced from this document via
 * `paragraphsBlobPath` / `originalFileBlobPath`.
 */
export interface ReaderBookDoc {
  id: string;
  title: string;
  subtitle: string;
  author: string;

  chapters?: BookChapterNavigationItem[];
  imageAspectRatioByHref?: Record<string, number>;

  highlights?: HighlightedText[];
  highlightsUpdatedAtIso?: string;

  readingPosition?: ReadingPosition;
  readingPositionUpdatedAtIso?: string;

  // Bumped when title/author/subtitle/paragraphs change.
  dataUpdatedAtIso?: string;

  // Pointers into Firebase Storage for the heavy payloads.
  paragraphsBlobPath?: string;
  originalFileBlobPath?: string;

  schemaVersion: 1;
  createdAtIso: string;
  // Top-level updatedAt — bumped on any field change.
  updatedAtIso: string;
}

export const READER_BOOK_DOC_SCHEMA_VERSION = 1 as const;
