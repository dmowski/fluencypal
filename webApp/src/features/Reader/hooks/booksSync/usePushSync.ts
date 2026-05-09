import { useCallback, useEffect } from 'react';
import { deleteDoc, setDoc } from 'firebase/firestore';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/features/Firebase/firebaseDb';
import { Book } from '../../model/types';
import { buildRemoteDocFromLocal } from '../booksSyncMerge';
import {
  deleteBookBlob,
  uploadOriginalFileBlob,
  uploadParagraphsBlob,
} from '../../server/readerStorage';
import { buildLocalSignature } from './signature';
import { errorLog, getErrorCode, getErrorMessage, log } from './log';
import { BooksSyncRefs, BooksSyncStatusSetters, PUSH_DEBOUNCE_MS } from './types';

interface Args {
  userId: string | null;
  isUsersBooksLoaded: boolean;
  usersBooks: Book[];
  applyRemoteBookMerge: (bookId: string, next: Book) => void;
  refs: BooksSyncRefs;
  setters: BooksSyncStatusSetters;
}

/**
 * Push-side of the sync loop. Watches `usersBooks`, debounces per-book pushes,
 * uploads paragraph/EPUB blobs to Storage on first push, and writes the
 * Firestore doc. Also handles remote cleanup when a book is deleted locally.
 */
export const usePushSync = ({
  userId,
  isUsersBooksLoaded,
  usersBooks,
  applyRemoteBookMerge,
  refs,
  setters,
}: Args): void => {
  const pushBook = useCallback(
    async (book: Book): Promise<void> => {
      if (!userId) return;
      if (refs.inFlightUploads.current.has(book.id)) {
        log('push skipped (already in flight)', { bookId: book.id });
        return;
      }

      const docRef = db.documents.readerBook(userId, book.id);
      if (!docRef) return;

      log('push start', {
        bookId: book.id,
        title: book.title,
        hasParagraphs: book.paragraphs.length,
        hasOriginalFile: !!book.originalFile,
        hasParagraphsBlob: !!book.paragraphsBlobPath,
        hasOriginalFileBlob: !!book.originalFileBlobPath,
        highlightsCount: book.highlights?.length ?? 0,
        highlightsIso: book.highlightsUpdatedAtIso ?? null,
      });
      refs.inFlightUploads.current.add(book.id);

      try {
        let paragraphsBlobPath = book.paragraphsBlobPath;
        let originalFileBlobPath = book.originalFileBlobPath;

        if (!paragraphsBlobPath && book.paragraphs.length > 0) {
          log('uploading paragraphs blob', {
            bookId: book.id,
            paragraphCount: book.paragraphs.length,
          });
          const upload = await uploadParagraphsBlob({
            userId,
            bookId: book.id,
            paragraphs: book.paragraphs,
          });
          paragraphsBlobPath = upload.path;
          log('paragraphs uploaded', {
            bookId: book.id,
            sizeBytes: upload.size,
            path: paragraphsBlobPath,
          });
          Sentry.addBreadcrumb({
            category: 'reader-sync',
            level: 'info',
            message: 'paragraphs uploaded',
            data: { bookId: book.id, sizeBytes: upload.size },
          });
        }

        if (!originalFileBlobPath && book.originalFile) {
          log('uploading original EPUB blob', {
            bookId: book.id,
            fileName: book.originalFile.name,
            sizeBytes: book.originalFile.size,
          });
          originalFileBlobPath = await uploadOriginalFileBlob({
            userId,
            bookId: book.id,
            file: book.originalFile,
          });
          log('original EPUB uploaded', { bookId: book.id, path: originalFileBlobPath });
          refs.knownOriginalPaths.current.set(book.id, originalFileBlobPath);
        }

        const nowIso = new Date().toISOString();
        const createdAtIso =
          refs.createdAtCache.current.get(book.id) ?? book.dataUpdatedAtIso ?? nowIso;
        const remoteDoc = buildRemoteDocFromLocal(
          { ...book, paragraphsBlobPath, originalFileBlobPath },
          { createdAtIso, nowIso },
        );

        await setDoc(docRef, remoteDoc);
        log('Firestore doc written', {
          bookId: book.id,
          highlightsCount: remoteDoc.highlights?.length ?? 0,
          paragraphsBlobPath,
          originalFileBlobPath,
        });

        refs.createdAtCache.current.set(book.id, createdAtIso);
        refs.knownRemoteIds.current.add(book.id);
        refs.lastPushedSignatures.current.set(
          book.id,
          buildLocalSignature({ ...book, paragraphsBlobPath, originalFileBlobPath }),
        );
        refs.lastPushedHighlightsIso.current.set(book.id, book.highlightsUpdatedAtIso ?? null);

        // Persist the storage pointers locally so we don't re-upload on every
        // push. Use the freshest local copy (not the closure-captured `book`)
        // so we don't clobber newer activePageIndex / highlight edits that
        // happened during the in-flight upload.
        const latestLocal = refs.usersBooks.current.find((entry) => entry.id === book.id) ?? book;
        if (
          paragraphsBlobPath !== latestLocal.paragraphsBlobPath ||
          originalFileBlobPath !== latestLocal.originalFileBlobPath
        ) {
          applyRemoteBookMerge(book.id, {
            ...latestLocal,
            paragraphsBlobPath,
            originalFileBlobPath,
          });
        }

        setters.setLastSyncIso(nowIso);
      } catch (pushError) {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'error',
          message: 'push error',
          data: { bookId: book.id, code: getErrorCode(pushError) },
        });
        Sentry.captureException(pushError, { tags: { area: 'reader-sync', op: 'push' } });
        errorLog('push error', { bookId: book.id }, pushError);
        setters.setStatus('error');
        setters.setError(getErrorMessage(pushError));
      } finally {
        refs.inFlightUploads.current.delete(book.id);
      }
    },
    [userId, applyRemoteBookMerge, refs, setters],
  );

  const schedulePush = useCallback(
    (book: Book, options?: { immediate?: boolean }): void => {
      const timers = refs.pushTimers.current;
      const existing = timers.get(book.id);
      if (existing) clearTimeout(existing);
      if (options?.immediate) {
        timers.delete(book.id);
        void pushBook(book);
        return;
      }
      const handle = setTimeout(() => {
        timers.delete(book.id);
        void pushBook(book);
      }, PUSH_DEBOUNCE_MS);
      timers.set(book.id, handle);
    },
    [pushBook, refs],
  );

  useEffect(() => {
    if (!userId) return;
    if (!isUsersBooksLoaded) return;

    usersBooks.forEach((book) => {
      const signature = buildLocalSignature(book);
      const suppressed = refs.suppressedSignatures.current.get(book.id);
      if (suppressed === signature) {
        refs.suppressedSignatures.current.delete(book.id);
        refs.lastPushedSignatures.current.set(book.id, signature);
        refs.lastPushedHighlightsIso.current.set(book.id, book.highlightsUpdatedAtIso ?? null);
        return;
      }
      const lastPushed = refs.lastPushedSignatures.current.get(book.id);
      if (lastPushed === signature) return;

      // Highlights: push immediately so multi-device sync feels realtime.
      // Other field edits (title/position/etc.) keep the small debounce.
      const lastHighlightsIso = refs.lastPushedHighlightsIso.current.get(book.id) ?? null;
      const currentHighlightsIso = book.highlightsUpdatedAtIso ?? null;
      const highlightsChanged = currentHighlightsIso !== lastHighlightsIso;
      log('scheduling push', {
        bookId: book.id,
        immediate: highlightsChanged,
        reason: highlightsChanged ? 'highlights-changed' : 'other-fields-changed',
      });
      schedulePush(book, { immediate: highlightsChanged });
    });

    // Detect locally-deleted books and remove the corresponding remote doc.
    const presentIds = new Set(usersBooks.map((book) => book.id));
    refs.knownRemoteIds.current.forEach((id) => {
      if (presentIds.has(id)) return;
      const docRef = db.documents.readerBook(userId, id);
      if (docRef) {
        void deleteDoc(docRef).catch((deleteError: unknown) => {
          Sentry.captureException(deleteError, {
            tags: { area: 'reader-sync', op: 'deleteDoc' },
            extra: { bookId: id },
          });
          errorLog('delete error', { bookId: id }, deleteError);
        });
      }
      const paragraphsPath = `users/${userId}/reader/${id}/paragraphs.json.gz`;
      void deleteBookBlob(paragraphsPath).catch((blobError: unknown) => {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'warning',
          message: 'paragraphs blob delete failed',
          data: { bookId: id, code: getErrorCode(blobError) },
        });
      });
      const originalPath = refs.knownOriginalPaths.current.get(id);
      if (originalPath) {
        void deleteBookBlob(originalPath).catch((blobError: unknown) => {
          Sentry.addBreadcrumb({
            category: 'reader-sync',
            level: 'warning',
            message: 'original-file blob delete failed',
            data: { bookId: id, code: getErrorCode(blobError) },
          });
        });
        refs.knownOriginalPaths.current.delete(id);
      }
      refs.knownRemoteIds.current.delete(id);
      refs.lastPushedSignatures.current.delete(id);
    });
  }, [usersBooks, userId, isUsersBooksLoaded, schedulePush, refs]);
};
