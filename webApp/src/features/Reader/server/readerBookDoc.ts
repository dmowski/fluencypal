import { BookChapterNavigationItem, HighlightedText } from '../model/types';

/**
 * Firestore document shape stored at `books/{bookId}` (root-level collection).
 *
 * Heavy/static data (paragraphs, original EPUB file, images) is NOT stored
 * here. Those are uploaded to Firebase Storage at
 * `books/{bookId}/...` and referenced from this document via
 * `paragraphsBlobPath` / `originalFileBlobPath`.
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

  // Pointers into Firebase Storage for the heavy payloads.
  paragraphsBlobPath?: string;
  originalFileBlobPath?: string;

  // Stores paths to every converted version (key = lowercase extension, value = storage path).
  convertedFiles?: Record<string, string>;

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
