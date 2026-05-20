import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Book } from '../../model/types';
import { downloadOriginalFileBlob } from '../../server/readerStorage';
import { parseEpubOnClient } from '../../utils/epubImport/parseEpub';
import { buildImageAspectRatioMap } from '../../utils/epubImport/imageUtils';
import { buildLocalSignature } from './signature';
import { getErrorCode, log, warn } from './log';
import { BooksSyncRefs } from './types';

interface Args {
  userId: string | null;
  isUsersBooksLoaded: boolean;
  usersBooks: Book[];
  refs: BooksSyncRefs;
}

/**
 * For every book that has a remote `convertedFiles.epub` path but no local
 * `epubFile`, downloads the EPUB once, persists it into IndexedDB, and
 * re-extracts embedded images on this device. Image data URLs are
 * intentionally not stored in Firestore (size); each device must rebuild
 * `imagesByHref` / `imageAspectRatioByHref` locally.
 *
 * The per-book lock in `refs.originalFileHydrations` survives effect
 * re-runs, so even though `usersBooks` changes on every snapshot we won't
 * launch more than one in-flight download per book.
 */
export const useOriginalFileHydration = ({
  userId,
  isUsersBooksLoaded,
  usersBooks,
  refs,
}: Args): void => {
  useEffect(() => {
    if (!userId) return;
    if (!isUsersBooksLoaded) return;

    usersBooks.forEach((book) => {
      if (book.epubFile) return;
      if (!book.convertedFiles.epub) return;
      if (refs.originalFileHydrations.current.has(book.id)) return;

      refs.originalFileHydrations.current.add(book.id);
      void hydrateOriginalFile(book, refs);
    });
  }, [usersBooks, userId, isUsersBooksLoaded, refs]);
};

const hydrateOriginalFile = async (book: Book, refs: BooksSyncRefs): Promise<void> => {
  const path = book.convertedFiles.epub;
  log('hydrating EPUB from Storage', { bookId: book.id, path });

  try {
    const result = await downloadOriginalFileBlob(path);
    if (!result) {
      warn('EPUB blob not found in Storage', { bookId: book.id, path });
      return;
    }

    const file = new File([result.blob], result.fileName, {
      type: result.blob.type || 'application/epub+zip',
    });
    log('EPUB downloaded, parsing for images', {
      bookId: book.id,
      fileName: result.fileName,
      sizeBytes: result.blob.size,
    });

    const { imagesByHref, imageAspectRatioByHref } = await extractImagesFromEpub(file, book.id);

    const latest = refs.usersBooks.current.find((entry) => entry.id === book.id);
    if (!latest) {
      warn('EPUB hydration: latest local copy missing', { bookId: book.id });
      return;
    }

    const next: Book = {
      ...latest,
      epubFile: file,
      ...(imagesByHref ? { imagesByHref } : {}),
      ...(imageAspectRatioByHref
        ? {
            imageAspectRatioByHref: {
              ...(latest.imageAspectRatioByHref ?? {}),
              ...imageAspectRatioByHref,
            },
          }
        : {}),
    };
    log('applying hydrated EPUB + images locally', {
      bookId: book.id,
      imagesAttached: imagesByHref ? Object.keys(imagesByHref).length : 0,
      aspectRatiosAttached: imageAspectRatioByHref ? Object.keys(imageAspectRatioByHref).length : 0,
    });
    refs.suppressedSignatures.current.set(book.id, buildLocalSignature(next));
    refs.applyRemoteBookMerge.current(book.id, next);
  } catch (downloadError) {
    Sentry.addBreadcrumb({
      category: 'reader-sync',
      level: 'warning',
      message: 'original file hydration failed',
      data: { bookId: book.id, code: getErrorCode(downloadError) },
    });
    warn(
      'original file hydration failed',
      { bookId: book.id, code: getErrorCode(downloadError) },
      downloadError,
    );
    // Allow a retry on next mount; don't keep the id in the in-flight set.
    refs.originalFileHydrations.current.delete(book.id);
  }
};

const extractImagesFromEpub = async (
  file: File,
  bookId: string,
): Promise<{
  imagesByHref?: Record<string, string>;
  imageAspectRatioByHref?: Record<string, number>;
}> => {
  try {
    const parsed = await parseEpubOnClient(file);
    const imageHrefCount = Object.keys(parsed.imageDataUrlByHref).length;
    log('parsed EPUB images', { bookId, imageHrefCount });
    if (imageHrefCount === 0) return {};
    return {
      imagesByHref: parsed.imageDataUrlByHref,
      imageAspectRatioByHref: await buildImageAspectRatioMap(parsed.imageDataUrlByHref),
    };
  } catch (parseError) {
    Sentry.addBreadcrumb({
      category: 'reader-sync',
      level: 'warning',
      message: 'image re-extract from hydrated EPUB failed',
      data: { bookId },
    });
    warn('image re-extract failed', { bookId }, parseError);
    return {};
  }
};
