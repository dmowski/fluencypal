import { Book, ConvertedFilesPathMap, createEmptyConvertedFilesPathMap } from '../model/types';
import { ReaderBookDoc } from '../server/readerBookDoc';

/**
 * Client-side migration helpers that bridge the legacy Reader book shape
 * (`originalFile` / `originalFileBlobPath` / loose `convertedFiles` record) to
 * the new shape (`epubFile` + required `ConvertedFilesPathMap`). Used both
 * when loading books from IndexedDB and when reading remote Firestore docs.
 *
 * These helpers are intentionally tolerant: they read from any legacy fields
 * that may still be present and produce a normalized shape without throwing.
 */

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeConvertedFiles = (
  rawConverted: unknown,
  rawOriginalBlobPath: unknown,
): { value: ConvertedFilesPathMap; changed: boolean } => {
  const empty = createEmptyConvertedFilesPathMap();

  // Legacy shape: `convertedFiles?: Record<string, string>` keyed by extension.
  if (isObject(rawConverted)) {
    const epub =
      typeof rawConverted.epub === 'string' && rawConverted.epub
        ? rawConverted.epub
        : typeof rawOriginalBlobPath === 'string' && rawOriginalBlobPath
          ? rawOriginalBlobPath
          : '';
    const pdf = typeof rawConverted.pdf === 'string' && rawConverted.pdf ? rawConverted.pdf : null;
    const docx =
      typeof rawConverted.docx === 'string' && rawConverted.docx ? rawConverted.docx : null;
    const value: ConvertedFilesPathMap = { epub, pdf, docx };
    const isNewShape =
      Object.keys(rawConverted).length === 3 &&
      'epub' in rawConverted &&
      'pdf' in rawConverted &&
      'docx' in rawConverted &&
      rawConverted.epub === epub &&
      (rawConverted.pdf ?? null) === pdf &&
      (rawConverted.docx ?? null) === docx;
    return { value, changed: !isNewShape };
  }

  if (typeof rawOriginalBlobPath === 'string' && rawOriginalBlobPath) {
    return { value: { ...empty, epub: rawOriginalBlobPath }, changed: true };
  }

  return { value: empty, changed: rawConverted !== undefined };
};

/**
 * Normalize a single legacy or current Book object. Returns the (possibly
 * unchanged) Book plus a flag indicating whether any rewrite happened so the
 * caller can decide whether to persist the result.
 */
export const migrateBookShape = (raw: Book): { book: Book; changed: boolean } => {
  // Cast through unknown so we can inspect removed legacy fields without
  // poisoning the public Book type.
  const legacy = raw as unknown as {
    originalFile?: File;
    originalFileBlobPath?: string;
    convertedFiles?: unknown;
  };

  let changed = false;
  const next: Book = { ...raw };

  if (legacy.originalFile && !next.epubFile) {
    next.epubFile = legacy.originalFile;
    changed = true;
  }
  if ('originalFile' in next) {
    delete (next as unknown as { originalFile?: File }).originalFile;
    changed = true;
  }

  const { value: convertedFiles, changed: convertedChanged } = normalizeConvertedFiles(
    legacy.convertedFiles,
    legacy.originalFileBlobPath,
  );
  if (convertedChanged || !raw.convertedFiles) {
    changed = true;
  }
  next.convertedFiles = convertedFiles;

  if ('originalFileBlobPath' in next) {
    delete (next as unknown as { originalFileBlobPath?: string }).originalFileBlobPath;
    changed = true;
  }

  return { book: next, changed };
};

/**
 * Normalize a batch of locally loaded books. Returns the rewritten array and
 * the ids that changed so the caller can persist only those entries back to
 * IndexedDB.
 */
export const migrateBooksLocal = (books: Book[]): { migrated: Book[]; changedIds: Set<string> } => {
  const changedIds = new Set<string>();
  const migrated = books.map((book) => {
    const result = migrateBookShape(book);
    if (result.changed) changedIds.add(book.id);
    return result.book;
  });
  return { migrated, changedIds };
};

/**
 * Normalize a remote Firestore book document. Mirrors `migrateBookShape` but
 * for the (slimmer) doc shape, so downstream merge/stub helpers can rely on
 * `convertedFiles` always being a populated ConvertedFilesPathMap.
 */
export const migrateRemoteDoc = (raw: ReaderBookDoc): ReaderBookDoc => {
  const legacy = raw as unknown as {
    originalFileBlobPath?: string;
    convertedFiles?: unknown;
  };
  const { value: convertedFiles } = normalizeConvertedFiles(
    legacy.convertedFiles,
    legacy.originalFileBlobPath,
  );
  const next: ReaderBookDoc = { ...raw, convertedFiles };
  if ('originalFileBlobPath' in next) {
    delete (next as unknown as { originalFileBlobPath?: string }).originalFileBlobPath;
  }
  return next;
};
