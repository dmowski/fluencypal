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
import { buildLocalSignature, buildSharingSignature } from './signature';
import { errorLog, getErrorCode, getErrorMessage, log, warn } from './log';
import {
  isTransientStorageError,
  nextTransientRetryDelayMs,
  PUSH_TRANSIENT_RETRY_MAX_ATTEMPTS,
} from './transientErrors';
import { BooksSyncRefs, BooksSyncStatusSetters, PUSH_DEBOUNCE_MS } from './types';

interface Args {
  userId: string | null;
  isUsersBooksLoaded: boolean;
  hasReceivedInitialSnapshot: boolean;
  usersBooks: Book[];
  applyRemoteBookMerge: (bookId: string, next: Book) => void;
  refs: BooksSyncRefs;
  setters: BooksSyncStatusSetters;
}

const stampOwnerUserId = (book: Book, userId: string): Book => {
  const isCurrentUserMember =
    book.ownerUserId === userId || (book.userIds?.includes(userId) ?? false);
  if (isCurrentUserMember) return book;
  return {
    ...book,
    ownerUserId: userId,
    userIds: book.userIds ?? [],
  };
};

/**
 * Push-side of the sync loop. Watches `usersBooks`, debounces per-book pushes,
 * uploads paragraph/EPUB blobs to Storage on first push, and writes the
 * Firestore doc. Also handles remote cleanup when a book is deleted locally.
 */
export const usePushSync = ({
  userId,
  isUsersBooksLoaded,
  hasReceivedInitialSnapshot,
  usersBooks,
  applyRemoteBookMerge,
  refs,
  setters,
}: Args): void => {
  const pushBook = useCallback(
    async (book: Book): Promise<void> => {
      if (!userId) return;
      if (refs.inFlightUploads.current.has(book.id)) {
        refs.pendingPushAfterUpload.current.add(book.id);
        log('push deferred (already in flight)', { bookId: book.id });
        return;
      }

      const docRef = db.documents.readerBook(book.id);
      if (!docRef) return;

      const getLatest = (): Book =>
        refs.usersBooks.current.find((entry) => entry.id === book.id) ?? book;

      const writeRemoteDoc = async (source: Book): Promise<{ nowIso: string; createdAtIso: string }> => {
        const nowIso = new Date().toISOString();
        const createdAtIso =
          refs.createdAtCache.current.get(book.id) ?? source.dataUpdatedAtIso ?? nowIso;
        const remoteDoc = buildRemoteDocFromLocal(stampOwnerUserId(source, userId), {
          createdAtIso,
          nowIso,
        });
        await setDoc(docRef, remoteDoc);
        return { nowIso, createdAtIso };
      };

      const latestAtStart = getLatest();
      log('push start', {
        bookId: book.id,
        title: latestAtStart.title,
        hasParagraphs: latestAtStart.paragraphs.length,
        hasEpubFile: !!latestAtStart.epubFile,
        hasParagraphsBlob: !!latestAtStart.paragraphsBlobPath,
        hasEpubBlob: !!latestAtStart.convertedFiles.epub,
        highlightsCount: latestAtStart.highlights?.length ?? 0,
        highlightsIso: latestAtStart.highlightsUpdatedAtIso ?? null,
        sharingSig: buildSharingSignature(latestAtStart),
      });
      refs.inFlightUploads.current.add(book.id);

      let paragraphsBlobPath = latestAtStart.paragraphsBlobPath;
      let convertedFiles = latestAtStart.convertedFiles;

      try {
        // Write the Firestore doc FIRST (without blob paths if they don't exist
        // yet). Always read the latest local copy so in-flight sharing edits
        // are not overwritten by a stale closure snapshot.
        const { nowIso, createdAtIso } = await writeRemoteDoc(getLatest());
        refs.knownRemoteIds.current.add(book.id);
        log('Firestore doc written (initial)', {
          bookId: book.id,
          memberIds: buildRemoteDocFromLocal(stampOwnerUserId(getLatest(), userId), {
            createdAtIso,
            nowIso,
          }).memberIds ?? null,
        });

        /**
         * Write blob paths to Firestore as soon as each upload succeeds so a
         * later transient failure (common on Mobile Safari for the EPUB) does
         * not leave Storage objects without a doc pointer. Local state is
         * patched only at the end of the push (or in the catch) to avoid
         * echo-scheduling a follow-up while this push is still in flight.
         */
        const persistBlobPathsRemote = async (): Promise<void> => {
          const stillExists = refs.usersBooks.current.some((b) => b.id === book.id);
          if (!stillExists) {
            log('skipping blob-path setDoc – book was deleted locally during upload', {
              bookId: book.id,
            });
            return;
          }
          await writeRemoteDoc({
            ...getLatest(),
            paragraphsBlobPath,
            convertedFiles,
          });
          log('Firestore doc updated with blob paths', {
            bookId: book.id,
            paragraphsBlobPath,
            convertedFilesEpub: convertedFiles.epub,
          });
        };

        const latestForUpload = getLatest();
        if (!paragraphsBlobPath && latestForUpload.paragraphs.length > 0) {
          log('uploading paragraphs blob', {
            bookId: book.id,
            paragraphCount: latestForUpload.paragraphs.length,
          });
          const upload = await uploadParagraphsBlob({
            bookId: book.id,
            paragraphs: latestForUpload.paragraphs,
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
          await persistBlobPathsRemote();
        }

        const latestForEpub = getLatest();
        if (!convertedFiles.epub && latestForEpub.epubFile) {
          log('uploading EPUB blob', {
            bookId: book.id,
            fileName: latestForEpub.epubFile.name,
            sizeBytes: latestForEpub.epubFile.size,
          });
          const epubPath = await uploadOriginalFileBlob({
            bookId: book.id,
            file: latestForEpub.epubFile,
          });
          convertedFiles = { ...convertedFiles, epub: epubPath };
          log('EPUB uploaded', { bookId: book.id, path: epubPath });
          refs.knownOriginalPaths.current.set(book.id, epubPath);
          await persistBlobPathsRemote();
        }

        refs.createdAtCache.current.set(book.id, createdAtIso);
        const latestFinal = getLatest();
        const signatureBook = {
          ...latestFinal,
          paragraphsBlobPath: paragraphsBlobPath ?? latestFinal.paragraphsBlobPath,
          convertedFiles,
          ownerUserId: latestFinal.ownerUserId ?? stampOwnerUserId(latestFinal, userId).ownerUserId,
        };
        refs.lastPushedSignatures.current.set(book.id, buildLocalSignature(signatureBook));
        refs.lastPushedHighlightsIso.current.set(
          book.id,
          latestFinal.highlightsUpdatedAtIso ?? null,
        );
        refs.lastPushedSharingSig.current.set(book.id, buildSharingSignature(latestFinal));
        refs.pushTransientRetryCounts.current.delete(book.id);
        const retryTimer = refs.pushRetryTimers.current.get(book.id);
        if (retryTimer) {
          clearTimeout(retryTimer);
          refs.pushRetryTimers.current.delete(book.id);
        }

        const needsLocalUpdate =
          paragraphsBlobPath !== latestFinal.paragraphsBlobPath ||
          JSON.stringify(convertedFiles) !== JSON.stringify(latestFinal.convertedFiles) ||
          (!latestFinal.ownerUserId && stampOwnerUserId(latestFinal, userId).ownerUserId);
        if (needsLocalUpdate) {
          applyRemoteBookMerge(book.id, {
            ...latestFinal,
            paragraphsBlobPath: paragraphsBlobPath ?? latestFinal.paragraphsBlobPath,
            convertedFiles,
            ownerUserId: latestFinal.ownerUserId ?? stampOwnerUserId(latestFinal, userId).ownerUserId,
          });
        }

        setters.setLastSyncIso(nowIso);
      } catch (pushError) {
        const code = getErrorCode(pushError);
        const transient = isTransientStorageError(pushError);
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: transient ? 'warning' : 'error',
          message: 'push error',
          data: { bookId: book.id, code, transient },
        });

        // Keep local blob paths in sync with anything we already wrote remotely
        // so a retry skips uploads that already succeeded.
        const latestOnError = getLatest();
        const partialBook = {
          ...latestOnError,
          paragraphsBlobPath: paragraphsBlobPath ?? latestOnError.paragraphsBlobPath,
          convertedFiles,
        };
        const partialChanged =
          partialBook.paragraphsBlobPath !== latestOnError.paragraphsBlobPath ||
          JSON.stringify(partialBook.convertedFiles) !==
            JSON.stringify(latestOnError.convertedFiles);
        if (partialChanged) {
          // Suppress the echo push from this merge; a transient retry (or a
          // later real edit) is responsible for finishing the upload.
          refs.suppressedSignatures.current.set(book.id, buildLocalSignature(partialBook));
          applyRemoteBookMerge(book.id, partialBook);
        }

        if (transient) {
          const attempt = (refs.pushTransientRetryCounts.current.get(book.id) ?? 0) + 1;
          refs.pushTransientRetryCounts.current.set(book.id, attempt);
          warn('push transient storage error', { bookId: book.id, code, attempt }, pushError);

          if (attempt < PUSH_TRANSIENT_RETRY_MAX_ATTEMPTS) {
            refs.pendingPushAfterUpload.current.delete(book.id);
            const delayMs = nextTransientRetryDelayMs(attempt - 1);
            log('scheduling transient push retry', { bookId: book.id, attempt, delayMs });
            const retryTimers = refs.pushRetryTimers.current;
            const existingRetry = retryTimers.get(book.id);
            if (existingRetry) clearTimeout(existingRetry);
            const handle = setTimeout(() => {
              retryTimers.delete(book.id);
              const latest = refs.usersBooks.current.find((entry) => entry.id === book.id);
              if (latest) void pushBook(latest);
            }, delayMs);
            retryTimers.set(book.id, handle);
            return;
          }

          Sentry.captureException(pushError, {
            tags: { area: 'reader-sync', op: 'push', transient: 'exhausted' },
            extra: { bookId: book.id, attempt },
          });
        } else {
          Sentry.captureException(pushError, { tags: { area: 'reader-sync', op: 'push' } });
          errorLog('push error', { bookId: book.id }, pushError);
        }

        setters.setStatus('error');
        setters.setError(getErrorMessage(pushError));
      } finally {
        refs.inFlightUploads.current.delete(book.id);
        if (refs.pendingPushAfterUpload.current.has(book.id)) {
          refs.pendingPushAfterUpload.current.delete(book.id);
          const latest = refs.usersBooks.current.find((entry) => entry.id === book.id);
          if (latest) {
            log('push follow-up after in-flight upload', { bookId: book.id });
            void pushBook(latest);
          }
        }
      }
    },
    [userId, applyRemoteBookMerge, refs, setters],
  );

  const schedulePush = useCallback(
    (book: Book, options?: { immediate?: boolean }): void => {
      // A real local edit supersedes a transient backoff retry.
      const retryTimer = refs.pushRetryTimers.current.get(book.id);
      if (retryTimer) {
        clearTimeout(retryTimer);
        refs.pushRetryTimers.current.delete(book.id);
      }

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
    if (!hasReceivedInitialSnapshot) return;

    usersBooks.forEach((book) => {
      const signature = buildLocalSignature(book);
      const suppressed = refs.suppressedSignatures.current.get(book.id);
      if (suppressed === signature) {
        refs.suppressedSignatures.current.delete(book.id);
        // A transient Storage retry is still responsible for finishing blob
        // uploads (e.g. EPUB after paragraphs already landed). Do not treat
        // this echo merge as a completed push or the EPUB will never upload.
        const hasTransientRetryPending =
          (refs.pushTransientRetryCounts.current.get(book.id) ?? 0) > 0 ||
          refs.pushRetryTimers.current.has(book.id);
        if (!hasTransientRetryPending) {
          refs.lastPushedSignatures.current.set(book.id, signature);
          refs.lastPushedHighlightsIso.current.set(book.id, book.highlightsUpdatedAtIso ?? null);
          refs.lastPushedSharingSig.current.set(book.id, buildSharingSignature(book));
        }
        return;
      }
      const lastPushed = refs.lastPushedSignatures.current.get(book.id);
      if (lastPushed === signature) return;

      const lastHighlightsIso = refs.lastPushedHighlightsIso.current.get(book.id) ?? null;
      const currentHighlightsIso = book.highlightsUpdatedAtIso ?? null;
      const highlightsChanged = currentHighlightsIso !== lastHighlightsIso;

      const lastSharingSig = refs.lastPushedSharingSig.current.get(book.id) ?? null;
      const sharingChanged = buildSharingSignature(book) !== lastSharingSig;

      const immediate = highlightsChanged || sharingChanged;
      log('scheduling push', {
        bookId: book.id,
        immediate,
        reason: highlightsChanged
          ? 'highlights-changed'
          : sharingChanged
            ? 'sharing-changed'
            : 'other-fields-changed',
      });
      schedulePush(book, { immediate });
    });

    const presentIds = new Set(usersBooks.map((book) => book.id));
    refs.knownRemoteIds.current.forEach((id) => {
      if (presentIds.has(id)) return;

      if (refs.leavedBookIds.current.has(id)) {
        refs.leavedBookIds.current.delete(id);
        refs.knownRemoteIds.current.delete(id);
        refs.lastPushedSignatures.current.delete(id);
        refs.lastPushedSharingSig.current.delete(id);
        return;
      }
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
      refs.lastPushedSharingSig.current.delete(id);
    });
  }, [usersBooks, userId, isUsersBooksLoaded, hasReceivedInitialSnapshot, schedulePush, refs]);
};
