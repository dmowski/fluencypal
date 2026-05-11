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

      const docRef = db.documents.readerBook(book.id);
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

        const nowIso = new Date().toISOString();
        const createdAtIso =
          refs.createdAtCache.current.get(book.id) ?? book.dataUpdatedAtIso ?? nowIso;

        // Stamp ownerUserId on first push so memberIds is populated.
        const bookWithOwner: Book = book.ownerUserId
          ? { ...book, paragraphsBlobPath, originalFileBlobPath }
          : {
              ...book,
              paragraphsBlobPath,
              originalFileBlobPath,
              ownerUserId: userId,
              userIds: book.userIds ?? [],
            };

        // Write the Firestore doc FIRST (without blob paths if they don't exist
        // yet). This establishes book membership so that subsequent Storage
        // uploads can pass the cross-service `firestore.get()` security rule.
        const initialDoc = buildRemoteDocFromLocal(bookWithOwner, { createdAtIso, nowIso });
        await setDoc(docRef, initialDoc);
        // Register in knownRemoteIds immediately after the first write so that
        // the delete-detection code can find and remove this document if the
        // user deletes the book locally while blobs are still uploading.
        refs.knownRemoteIds.current.add(book.id);
        log('Firestore doc written (initial)', {
          bookId: book.id,
          highlightsCount: initialDoc.highlights?.length ?? 0,
          paragraphsBlobPath: initialDoc.paragraphsBlobPath ?? null,
        });

        // Upload blobs now that the Firestore doc exists.
        let blobsChanged = false;

        if (!paragraphsBlobPath && book.paragraphs.length > 0) {
          log('uploading paragraphs blob', {
            bookId: book.id,
            paragraphCount: book.paragraphs.length,
          });
          const upload = await uploadParagraphsBlob({
            bookId: book.id,
            paragraphs: book.paragraphs,
          });
          paragraphsBlobPath = upload.path;
          blobsChanged = true;
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
            bookId: book.id,
            file: book.originalFile,
          });
          blobsChanged = true;
          log('original EPUB uploaded', { bookId: book.id, path: originalFileBlobPath });
          refs.knownOriginalPaths.current.set(book.id, originalFileBlobPath);
        }

        // If blob paths were resolved, update the Firestore doc with them.
        // Guard: skip if the book was deleted locally while blobs were uploading —
        // the delete-detection code will remove the Firestore doc instead.
        const stillExists = refs.usersBooks.current.some((b) => b.id === book.id);
        if (blobsChanged && stillExists) {
          const finalDoc = buildRemoteDocFromLocal(
            { ...bookWithOwner, paragraphsBlobPath, originalFileBlobPath },
            { createdAtIso, nowIso },
          );
          await setDoc(docRef, finalDoc);
          log('Firestore doc updated with blob paths', {
            bookId: book.id,
            paragraphsBlobPath,
            originalFileBlobPath,
          });
        } else if (blobsChanged && !stillExists) {
          log('skipping final setDoc – book was deleted locally during blob upload', {
            bookId: book.id,
          });
        }

        refs.createdAtCache.current.set(book.id, createdAtIso);
        // knownRemoteIds was already updated right after the first setDoc above.
        // Include resolved blob paths in the stored signature so the effect
        // does not see a stale mismatch and schedule a redundant second push.
        refs.lastPushedSignatures.current.set(
          book.id,
          buildLocalSignature({ ...bookWithOwner, paragraphsBlobPath, originalFileBlobPath }),
        );
        refs.lastPushedHighlightsIso.current.set(book.id, book.highlightsUpdatedAtIso ?? null);

        // Persist the storage pointers and ownerUserId locally so we don't
        // re-upload on every push. Use the freshest local copy (not the
        // closure-captured `book`) so we don't clobber newer edits that
        // happened during the in-flight upload.
        const latestLocal = refs.usersBooks.current.find((entry) => entry.id === book.id) ?? book;
        const needsLocalUpdate =
          paragraphsBlobPath !== latestLocal.paragraphsBlobPath ||
          originalFileBlobPath !== latestLocal.originalFileBlobPath ||
          (!latestLocal.ownerUserId && bookWithOwner.ownerUserId);
        if (needsLocalUpdate) {
          applyRemoteBookMerge(book.id, {
            ...latestLocal,
            paragraphsBlobPath,
            originalFileBlobPath,
            ownerUserId: latestLocal.ownerUserId ?? bookWithOwner.ownerUserId,
            userIds: latestLocal.userIds ?? bookWithOwner.userIds,
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
      const docRef = db.documents.readerBook(id);
      if (docRef) {
        void deleteDoc(docRef).catch((deleteError: unknown) => {
          Sentry.captureException(deleteError, {
            tags: { area: 'reader-sync', op: 'deleteDoc' },
            extra: { bookId: id },
          });
          errorLog('delete error', { bookId: id }, deleteError);
        });
      }
      const paragraphsPath = `books/${id}/paragraphs.json.gz`;
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
