import { Book } from '../model/types';
import { ReaderBookDoc, READER_BOOK_DOC_SCHEMA_VERSION } from '../server/readerBookDoc';

const isoToTime = (iso?: string): number => {
  if (!iso) return 0;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
};

/**
 * Per-field, last-writer-wins merge of a local Book against a remote
 * ReaderBookDoc. The remote document never carries `paragraphs` or
 * `originalFile` (those live in Storage), so they are always preserved from
 * the local copy.
 *
 * Returns `null` when the merge produced no changes vs the local copy.
 */
export const mergeRemoteBookIntoLocal = (local: Book, remote: ReaderBookDoc): Book | null => {
  const merged: Book = { ...local };
  let changed = false;

  // Core data fields (title/subtitle/author/chapters/imageAspectRatioByHref).
  if (isoToTime(remote.dataUpdatedAtIso) > isoToTime(local.dataUpdatedAtIso)) {
    if (remote.title !== local.title) {
      merged.title = remote.title;
      changed = true;
    }
    if (remote.subtitle !== local.subtitle) {
      merged.subtitle = remote.subtitle;
      changed = true;
    }
    if (remote.author !== local.author) {
      merged.author = remote.author;
      changed = true;
    }
    if (remote.chapters !== undefined) {
      merged.chapters = remote.chapters;
      changed = true;
    }
    if (remote.imageAspectRatioByHref !== undefined) {
      merged.imageAspectRatioByHref = remote.imageAspectRatioByHref;
      changed = true;
    }
    merged.dataUpdatedAtIso = remote.dataUpdatedAtIso;
  }

  // Highlights — whole-array LWW.
  if (isoToTime(remote.highlightsUpdatedAtIso) > isoToTime(local.highlightsUpdatedAtIso)) {
    merged.highlights = remote.highlights ?? [];
    merged.highlightsUpdatedAtIso = remote.highlightsUpdatedAtIso;
    changed = true;
  }

  // Reading position — content anchor LWW. Local activePageIndex is preserved
  // (device-local cache); the consumer re-resolves the page from the new
  // anchor on render.
  if (
    isoToTime(remote.readingPositionUpdatedAtIso) > isoToTime(local.readingPositionUpdatedAtIso)
  ) {
    merged.readingPosition = remote.readingPosition;
    merged.readingPositionUpdatedAtIso = remote.readingPositionUpdatedAtIso;
    changed = true;
  }

  // Storage pointers — adopt latest if the remote knows about them.
  if (remote.paragraphsBlobPath && remote.paragraphsBlobPath !== local.paragraphsBlobPath) {
    merged.paragraphsBlobPath = remote.paragraphsBlobPath;
    changed = true;
  }
  if (remote.originalFileBlobPath && remote.originalFileBlobPath !== local.originalFileBlobPath) {
    merged.originalFileBlobPath = remote.originalFileBlobPath;
    changed = true;
  }

  return changed ? merged : null;
};

/**
 * Builds a stub local Book from a remote document for a book the local device
 * has never seen. Paragraphs are intentionally empty — they are downloaded
 * lazily on first open via the Storage `paragraphsBlobPath` pointer.
 */
export const buildStubBookFromRemote = (remote: ReaderBookDoc): Book => ({
  id: remote.id,
  title: remote.title,
  subtitle: remote.subtitle,
  author: remote.author,
  chapters: remote.chapters,
  imageAspectRatioByHref: remote.imageAspectRatioByHref,
  paragraphs: [],
  highlights: remote.highlights,
  highlightsUpdatedAtIso: remote.highlightsUpdatedAtIso,
  readingPosition: remote.readingPosition,
  readingPositionUpdatedAtIso: remote.readingPositionUpdatedAtIso,
  dataUpdatedAtIso: remote.dataUpdatedAtIso,
  paragraphsBlobPath: remote.paragraphsBlobPath,
  originalFileBlobPath: remote.originalFileBlobPath,
});

/**
 * Builds the Firestore document payload from a local Book. Strips paragraphs
 * and the original File object — those belong in Storage.
 */
export const buildRemoteDocFromLocal = (
  local: Book,
  options: { createdAtIso: string; nowIso: string },
): ReaderBookDoc => {
  const doc: ReaderBookDoc = {
    id: local.id,
    title: local.title,
    subtitle: local.subtitle,
    author: local.author,
    schemaVersion: READER_BOOK_DOC_SCHEMA_VERSION,
    createdAtIso: options.createdAtIso,
    updatedAtIso: options.nowIso,
  };
  if (local.chapters !== undefined) doc.chapters = local.chapters;
  if (local.imageAspectRatioByHref !== undefined) {
    doc.imageAspectRatioByHref = local.imageAspectRatioByHref;
  }
  if (local.highlights !== undefined) doc.highlights = local.highlights;
  if (local.highlightsUpdatedAtIso) doc.highlightsUpdatedAtIso = local.highlightsUpdatedAtIso;
  if (local.readingPosition) doc.readingPosition = local.readingPosition;
  if (local.readingPositionUpdatedAtIso) {
    doc.readingPositionUpdatedAtIso = local.readingPositionUpdatedAtIso;
  }
  if (local.dataUpdatedAtIso) doc.dataUpdatedAtIso = local.dataUpdatedAtIso;
  if (local.paragraphsBlobPath) doc.paragraphsBlobPath = local.paragraphsBlobPath;
  if (local.originalFileBlobPath) doc.originalFileBlobPath = local.originalFileBlobPath;
  return doc;
};
