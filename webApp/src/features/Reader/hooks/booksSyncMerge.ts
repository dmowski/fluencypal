import { Book, createEmptyConvertedFilesPathMap } from '../model/types';
import { ReaderBookDoc, READER_BOOK_DOC_SCHEMA_VERSION } from '../server/readerBookDoc';

const isoToTime = (iso?: string): number => {
  if (!iso) return 0;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
};

/**
 * Per-field, last-writer-wins merge of a local Book against a remote
 * ReaderBookDoc. The remote document never carries `paragraphs` or `epubFile`
 * (those live in Storage / IndexedDB), so they are always preserved from the
 * local copy.
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

  // Sharing metadata — always adopt from remote (owner manages the list).
  if (remote.ownerUserId !== undefined && remote.ownerUserId !== local.ownerUserId) {
    merged.ownerUserId = remote.ownerUserId;
    changed = true;
  }
  if (remote.userIds !== undefined) {
    const remoteIds = JSON.stringify([...remote.userIds].sort());
    const localIds = JSON.stringify([...(local.userIds ?? [])].sort());
    if (remoteIds !== localIds) {
      merged.userIds = remote.userIds;
      changed = true;
    }
  }
  if (remote.memberEmails !== undefined) {
    const remoteEmails = JSON.stringify(remote.memberEmails);
    const localEmails = JSON.stringify(local.memberEmails ?? {});
    if (remoteEmails !== localEmails) {
      merged.memberEmails = remote.memberEmails;
      changed = true;
    }
  }

  // Reading position is intentionally NOT synced — it lives in BookLocalProgress
  // (IndexedDB only). The remote schema no longer carries these fields.

  // Storage pointers — adopt latest if the remote knows about them.
  if (remote.paragraphsBlobPath && remote.paragraphsBlobPath !== local.paragraphsBlobPath) {
    merged.paragraphsBlobPath = remote.paragraphsBlobPath;
    changed = true;
  }
  if (JSON.stringify(remote.convertedFiles) !== JSON.stringify(local.convertedFiles)) {
    merged.convertedFiles = remote.convertedFiles;
    changed = true;
  }
  if (
    remote.epubParserVersion !== undefined &&
    remote.epubParserVersion !== local.epubParserVersion
  ) {
    merged.epubParserVersion = remote.epubParserVersion;
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
  // Reading position (BookLocalProgress) is intentionally not hydrated from
  // remote — it lives in IndexedDB only.
  dataUpdatedAtIso: remote.dataUpdatedAtIso,
  paragraphsBlobPath: remote.paragraphsBlobPath,
  convertedFiles: remote.convertedFiles ?? createEmptyConvertedFilesPathMap(),
  epubParserVersion: remote.epubParserVersion,
  ownerUserId: remote.ownerUserId,
  userIds: remote.userIds,
  memberEmails: remote.memberEmails,
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
    convertedFiles: local.convertedFiles,
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
  // Reading position stays local (BookLocalProgress) — do not write to Firestore.
  if (local.dataUpdatedAtIso) doc.dataUpdatedAtIso = local.dataUpdatedAtIso;
  if (local.paragraphsBlobPath) doc.paragraphsBlobPath = local.paragraphsBlobPath;
  if (local.epubParserVersion !== undefined) doc.epubParserVersion = local.epubParserVersion;
  if (local.ownerUserId !== undefined) doc.ownerUserId = local.ownerUserId;
  if (local.userIds !== undefined) doc.userIds = local.userIds;
  if (local.memberEmails !== undefined) doc.memberEmails = local.memberEmails;
  // Keep memberIds in sync so per-user collection queries work.
  if (local.ownerUserId !== undefined) {
    doc.memberIds = [local.ownerUserId, ...(local.userIds ?? [])];
  }
  return doc;
};
