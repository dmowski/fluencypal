import { Book } from '../../model/types';

/**
 * Stable string fingerprint of the parts of a Book that should round-trip
 * through Firestore. Reading position is intentionally excluded — it is a
 * device-local cache and must never trigger remote sync pushes.
 */
export const buildLocalSignature = (book: Book): string =>
  JSON.stringify({
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    chapters: book.chapters ?? null,
    imageAspectRatioByHref: book.imageAspectRatioByHref ?? null,
    highlights: book.highlights ?? null,
    highlightsUpdatedAtIso: book.highlightsUpdatedAtIso ?? null,
    dataUpdatedAtIso: book.dataUpdatedAtIso ?? null,
    paragraphsBlobPath: book.paragraphsBlobPath ?? null,
    convertedFiles: book.convertedFiles,
    epubParserVersion: book.epubParserVersion ?? null,
    ownerUserId: book.ownerUserId ?? null,
    userIds: book.userIds ? [...book.userIds].sort() : null,
    memberEmails: book.memberEmails ?? null,
  });
