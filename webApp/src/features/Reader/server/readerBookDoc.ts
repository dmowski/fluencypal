import { BookChapterNavigationItem, ConvertedFilesPathMap, HighlightedText } from '../model/types';

/**
 * Firestore document shape stored at `books/{bookId}` (root-level collection).
 *
 * Heavy/static data (paragraphs, EPUB file, images) is NOT stored here.
 * Those are uploaded to Firebase Storage at `books/{bookId}/...` and
 * referenced from this document via `paragraphsBlobPath` and the
 * `convertedFiles` path map (`convertedFiles.epub` is the canonical EPUB
 * source — it replaces the legacy `originalFileBlobPath`).
 *
 * Reading progress (readingPosition, activePageIndex) is intentionally absent —
 * it is a per-device local concern stored in IndexedDB only (see BookLocalProgress).
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

  // Bumped when title/author/subtitle/paragraphs change.
  dataUpdatedAtIso?: string;

  // Pointer into Firebase Storage for the heavy paragraphs payload.
  paragraphsBlobPath?: string;

  // Storage paths for every available file version of the book. `epub` is the
  // canonical reading source. May briefly hold an empty string for a freshly
  // created book whose EPUB upload has not yet completed.
  convertedFiles: ConvertedFilesPathMap;

  // Parser version that produced `paragraphs` (stored as a Storage blob) and
  // `chapters`. Clients re-import when this does not match the current
  // EPUB_PARSER_VERSION.
  epubParserVersion?: number;

  // Sharing. ownerUserId is the creator; userIds holds additional collaborators
  // (not including the owner). Optional for backward-compatibility with legacy
  // per-user documents written before sharing was introduced.
  ownerUserId?: string;
  userIds?: string[];
  // Maps userId → email for all known members (owner + collaborators).
  memberEmails?: Record<string, string>;
  // Denormalized array of all members: [ownerUserId, ...userIds].
  // Used as the query target for `where('memberIds', 'array-contains', uid)`
  // so the /books root collection can be efficiently subscribed to per-user.
  memberIds?: string[];

  schemaVersion: 1;
  createdAtIso: string;
  // Top-level updatedAt — bumped on any field change.
  updatedAtIso: string;
}

export const READER_BOOK_DOC_SCHEMA_VERSION = 1 as const;
