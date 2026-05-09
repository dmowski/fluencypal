'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/features/Firebase/firebaseDb';
import { useAuth } from '@/features/Auth/useAuth';
import { Book } from '../model/types';
import { useBooks } from './useBooks';
import {
  buildRemoteDocFromLocal,
  buildStubBookFromRemote,
  mergeRemoteBookIntoLocal,
} from './booksSyncMerge';
import {
  deleteBookBlob,
  downloadOriginalFileBlob,
  downloadParagraphsBlob,
  uploadOriginalFileBlob,
  uploadParagraphsBlob,
} from '../server/readerStorage';
export type BooksSyncStatus = 'idle' | 'syncing' | 'error';

interface BooksSyncContextValue {
  status: BooksSyncStatus;
  lastSyncIso: string | null;
  error: string | null;
  isInitialSyncing: boolean;
}

const BooksSyncContext = createContext<BooksSyncContextValue>({
  status: 'idle',
  lastSyncIso: null,
  error: null,
  isInitialSyncing: false,
});

const PUSH_DEBOUNCE_MS = 800;

const buildLocalSignature = (book: Book): string =>
  JSON.stringify({
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    chapters: book.chapters ?? null,
    imageAspectRatioByHref: book.imageAspectRatioByHref ?? null,
    highlights: book.highlights ?? null,
    highlightsUpdatedAtIso: book.highlightsUpdatedAtIso ?? null,
    readingPosition: book.readingPosition ?? null,
    readingPositionUpdatedAtIso: book.readingPositionUpdatedAtIso ?? null,
    dataUpdatedAtIso: book.dataUpdatedAtIso ?? null,
    paragraphsBlobPath: book.paragraphsBlobPath ?? null,
    originalFileBlobPath: book.originalFileBlobPath ?? null,
  });

const useBooksSyncState = (): BooksSyncContextValue => {
  const auth = useAuth();
  const books = useBooks();
  const userId = auth.uid || null;

  const [status, setStatus] = useState<BooksSyncStatus>('idle');
  const [lastSyncIso, setLastSyncIso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tracks ids we've ever seen from the server so we can detect deletions.
  const knownRemoteIdsRef = useRef<Set<string>>(new Set());
  // Remembers the original-file blob path for each known book so we can clean
  // it up when the book is deleted locally, even if the local copy never had
  // the path (e.g. for stubs hydrated from a remote snapshot).
  const knownOriginalPathsRef = useRef<Map<string, string>>(new Map());
  // Suppresses an immediate echo-push when a remote merge updates local state.
  const suppressedSignaturesRef = useRef<Map<string, string>>(new Map());
  const lastPushedSignaturesRef = useRef<Map<string, string>>(new Map());
  const pushTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlightUploadsRef = useRef<Set<string>>(new Set());
  const createdAtCacheRef = useRef<Map<string, string>>(new Map());
  // Last-pushed highlights timestamp per book — used to detect highlight
  // edits and bypass the debounce so cross-device highlight sync feels
  // realtime.
  const lastPushedHighlightsIsoRef = useRef<Map<string, string | null>>(new Map());
  // Tracks which books we already kicked off an original-file hydration for,
  // so the eager-download effect doesn't repeatedly fetch the same blob if
  // the underlying state churns while the download is in flight.
  const originalFileHydrationsRef = useRef<Set<string>>(new Set());
  // Always points at the latest snapshot of `usersBooks` so debounced async
  // pushes and the long-lived snapshot subscription can read fresh state
  // instead of the closure they captured at schedule/subscribe time. Without
  // this the snapshot handler would treat freshly-uploaded local books as
  // "unknown" and overwrite them with empty-paragraph stubs (causing the
  // page to briefly blank on every Firestore echo).
  const usersBooksRef = useRef<Book[]>(books.usersBooks);
  const applyRemoteBookMergeRef = useRef(books.applyRemoteBookMerge);
  const removeBookLocallyRef = useRef(books.removeBookLocally);

  const usersBooks = books.usersBooks;
  usersBooksRef.current = usersBooks;
  applyRemoteBookMergeRef.current = books.applyRemoteBookMerge;
  removeBookLocallyRef.current = books.removeBookLocally;

  // ---- Subscribe to remote collection ---------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      knownRemoteIdsRef.current = new Set();
      knownOriginalPathsRef.current = new Map();
      suppressedSignaturesRef.current = new Map();
      lastPushedSignaturesRef.current = new Map();
      createdAtCacheRef.current = new Map();
      return;
    }
    // Wait until local IndexedDB books have hydrated before subscribing —
    // otherwise the first snapshot races the local load, sees no `local`
    // match, and persists a stub WITHOUT `imagesByHref` / `originalFile`,
    // permanently overwriting the local copy in IndexedDB.
    if (!books.isUsersBooksLoaded) return;

    const collectionRef = db.collections.readerBooks(userId);
    if (!collectionRef) return;

    setStatus('syncing');

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const seenIds = new Set<string>();
        snapshot.docs.forEach((docSnap) => {
          const remote = docSnap.data();
          seenIds.add(remote.id);
          createdAtCacheRef.current.set(remote.id, remote.createdAtIso);
          if (remote.originalFileBlobPath) {
            knownOriginalPathsRef.current.set(remote.id, remote.originalFileBlobPath);
          }

          const local = usersBooksRef.current.find((book) => book.id === remote.id);
          if (!local) {
            const stub = buildStubBookFromRemote(remote);
            suppressedSignaturesRef.current.set(stub.id, buildLocalSignature(stub));
            applyRemoteBookMergeRef.current(stub.id, stub);
            return;
          }

          const merged = mergeRemoteBookIntoLocal(local, remote);
          if (merged) {
            suppressedSignaturesRef.current.set(merged.id, buildLocalSignature(merged));
            applyRemoteBookMergeRef.current(merged.id, merged);
          }
        });

        // Remote deletions: ids we knew about but didn't receive this snapshot.
        knownRemoteIdsRef.current.forEach((id) => {
          if (!seenIds.has(id)) {
            removeBookLocallyRef.current(id);
          }
        });

        knownRemoteIdsRef.current = seenIds;
        setStatus('idle');
        setLastSyncIso(new Date().toISOString());
      },
      (snapshotError) => {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'error',
          message: 'readerBooks subscription error',
          data: { code: (snapshotError as { code?: string }).code ?? null },
        });
        Sentry.captureException(snapshotError, { tags: { area: 'reader-sync', op: 'subscribe' } });
        console.error('[useBooksSync] subscription error', snapshotError);
        setStatus('error');
        setError(snapshotError.message);
      },
    );

    return () => {
      unsubscribe();
      pushTimersRef.current.forEach(clearTimeout);
      pushTimersRef.current.clear();
    };
    // We intentionally only re-subscribe when the user changes — `books` is a
    // stable context object and snapshot handler reads `books.usersBooks`
    // directly via the latest closure on each event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, books.isUsersBooksLoaded]);

  // ---- Push local mutations to Firestore (debounced per book) ---------------------------------
  const pushBook = useCallback(
    async (book: Book) => {
      if (!userId) return;
      if (inFlightUploadsRef.current.has(book.id)) return;

      const docRef = db.documents.readerBook(userId, book.id);
      if (!docRef) return;

      inFlightUploadsRef.current.add(book.id);
      try {
        let paragraphsBlobPath = book.paragraphsBlobPath;
        let originalFileBlobPath = book.originalFileBlobPath;

        // Upload paragraphs to Storage on first push (or if pointer absent).
        if (!paragraphsBlobPath && book.paragraphs.length > 0) {
          const upload = await uploadParagraphsBlob({
            userId,
            bookId: book.id,
            paragraphs: book.paragraphs,
          });
          paragraphsBlobPath = upload.path;
          Sentry.addBreadcrumb({
            category: 'reader-sync',
            level: 'info',
            message: 'paragraphs uploaded',
            data: { bookId: book.id, sizeBytes: upload.size },
          });
        }

        if (!originalFileBlobPath && book.originalFile) {
          originalFileBlobPath = await uploadOriginalFileBlob({
            userId,
            bookId: book.id,
            file: book.originalFile,
          });
          knownOriginalPathsRef.current.set(book.id, originalFileBlobPath);
        }

        const nowIso = new Date().toISOString();
        const createdAtIso =
          createdAtCacheRef.current.get(book.id) ?? book.dataUpdatedAtIso ?? nowIso;
        const remoteDoc = buildRemoteDocFromLocal(
          { ...book, paragraphsBlobPath, originalFileBlobPath },
          { createdAtIso, nowIso },
        );

        await setDoc(docRef, remoteDoc);
        createdAtCacheRef.current.set(book.id, createdAtIso);
        knownRemoteIdsRef.current.add(book.id);
        lastPushedSignaturesRef.current.set(
          book.id,
          buildLocalSignature({ ...book, paragraphsBlobPath, originalFileBlobPath }),
        );
        lastPushedHighlightsIsoRef.current.set(book.id, book.highlightsUpdatedAtIso ?? null);

        // Persist the storage pointers locally so we don't re-upload on every
        // push. Use the freshest local copy (not the closure-captured `book`)
        // so we don't clobber newer activePageIndex / highlight edits that
        // happened during the in-flight upload.
        const latestLocal = usersBooksRef.current.find((entry) => entry.id === book.id) ?? book;
        if (
          paragraphsBlobPath !== latestLocal.paragraphsBlobPath ||
          originalFileBlobPath !== latestLocal.originalFileBlobPath
        ) {
          books.applyRemoteBookMerge(book.id, {
            ...latestLocal,
            paragraphsBlobPath,
            originalFileBlobPath,
          });
        }

        setLastSyncIso(nowIso);
      } catch (pushError: any) {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'error',
          message: 'push error',
          data: { bookId: book.id, code: pushError?.code ?? null },
        });
        Sentry.captureException(pushError, { tags: { area: 'reader-sync', op: 'push' } });
        console.error('[useBooksSync] push error', pushError);
        setStatus('error');
        setError(pushError?.message ?? String(pushError));
      } finally {
        inFlightUploadsRef.current.delete(book.id);
      }
    },
    [userId, books],
  );

  const schedulePush = useCallback(
    (book: Book, options?: { immediate?: boolean }) => {
      const timers = pushTimersRef.current;
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
    [pushBook],
  );

  useEffect(() => {
    if (!userId) return;
    if (!books.isUsersBooksLoaded) return;

    usersBooks.forEach((book) => {
      const signature = buildLocalSignature(book);
      const suppressed = suppressedSignaturesRef.current.get(book.id);
      if (suppressed === signature) {
        suppressedSignaturesRef.current.delete(book.id);
        lastPushedSignaturesRef.current.set(book.id, signature);
        lastPushedHighlightsIsoRef.current.set(book.id, book.highlightsUpdatedAtIso ?? null);
        return;
      }
      const lastPushed = lastPushedSignaturesRef.current.get(book.id);
      if (lastPushed === signature) return;
      // Highlights: push immediately so multi-device sync feels realtime.
      // Other field edits (title/position/etc.) keep the small debounce.
      const lastHighlightsIso = lastPushedHighlightsIsoRef.current.get(book.id) ?? null;
      const currentHighlightsIso = book.highlightsUpdatedAtIso ?? null;
      const highlightsChanged = currentHighlightsIso !== lastHighlightsIso;
      schedulePush(book, { immediate: highlightsChanged });
    });

    // Detect locally-deleted books and remove the corresponding remote doc.
    const presentIds = new Set(usersBooks.map((book) => book.id));
    knownRemoteIdsRef.current.forEach((id) => {
      if (!presentIds.has(id)) {
        const docRef = db.documents.readerBook(userId, id);
        if (docRef) {
          void deleteDoc(docRef).catch((deleteError) => {
            Sentry.captureException(deleteError, {
              tags: { area: 'reader-sync', op: 'deleteDoc' },
              extra: { bookId: id },
            });
            console.error('[useBooksSync] delete error', deleteError);
          });
        }
        const paragraphsPath = `users/${userId}/reader/${id}/paragraphs.json.gz`;
        void deleteBookBlob(paragraphsPath).catch((blobError) => {
          Sentry.addBreadcrumb({
            category: 'reader-sync',
            level: 'warning',
            message: 'paragraphs blob delete failed',
            data: { bookId: id, code: (blobError as { code?: string })?.code ?? null },
          });
        });
        const originalPath = knownOriginalPathsRef.current.get(id);
        if (originalPath) {
          void deleteBookBlob(originalPath).catch((blobError) => {
            Sentry.addBreadcrumb({
              category: 'reader-sync',
              level: 'warning',
              message: 'original-file blob delete failed',
              data: { bookId: id, code: (blobError as { code?: string })?.code ?? null },
            });
          });
          knownOriginalPathsRef.current.delete(id);
        }
        knownRemoteIdsRef.current.delete(id);
        lastPushedSignaturesRef.current.delete(id);
      }
    });
  }, [usersBooks, userId, books.isUsersBooksLoaded, schedulePush]);

  // ---- Lazy paragraph hydration when active book is a remote stub -----------------------------
  useEffect(() => {
    if (!userId) return;
    const active = books.active;
    if (!active) return;
    if (active.paragraphs.length > 0) return;
    if (!active.paragraphsBlobPath) return;

    let isCancelled = false;
    (async () => {
      try {
        const paragraphs = await downloadParagraphsBlob({ userId, bookId: active.id });
        if (isCancelled || !paragraphs) return;
        const signature = buildLocalSignature({ ...active, paragraphs });
        suppressedSignaturesRef.current.set(active.id, signature);
        books.applyRemoteBookMerge(active.id, { ...active, paragraphs });
      } catch (downloadError: any) {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'error',
          message: 'paragraphs download failed',
          data: { bookId: active.id, code: downloadError?.code ?? null },
        });
        Sentry.captureException(downloadError, {
          tags: { area: 'reader-sync', op: 'downloadParagraphs' },
        });
        console.error('[useBooksSync] paragraphs download failed', downloadError);
        setError(downloadError?.message ?? String(downloadError));
      }
    })();

    return () => {
      isCancelled = true;
    };
    // Re-run when the active book id changes or its paragraphsBlobPath shows up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, books.active?.id, books.active?.paragraphsBlobPath, books.active?.paragraphs.length]);

  // ---- Eager hydration of the original EPUB file on every device ------------------------------
  // Whenever we know about a remote `originalFileBlobPath` for a book that
  // doesn't yet have a local `originalFile`, download it once and persist it
  // into IndexedDB so the Download button works without a network round-trip
  // on subsequent visits (and on devices that never imported the file
  // themselves).
  useEffect(() => {
    if (!userId) return;
    if (!books.isUsersBooksLoaded) return;

    const cancellations: Array<() => void> = [];

    usersBooks.forEach((book) => {
      if (book.originalFile) return;
      if (!book.originalFileBlobPath) return;
      if (originalFileHydrationsRef.current.has(book.id)) return;

      originalFileHydrationsRef.current.add(book.id);
      let isCancelled = false;
      cancellations.push(() => {
        isCancelled = true;
      });

      (async () => {
        try {
          const result = await downloadOriginalFileBlob(book.originalFileBlobPath!);
          if (isCancelled || !result) return;
          const file = new File([result.blob], result.fileName, {
            type: result.blob.type || 'application/epub+zip',
          });
          const latest = usersBooksRef.current.find((entry) => entry.id === book.id);
          if (!latest) return;
          const next = { ...latest, originalFile: file };
          suppressedSignaturesRef.current.set(book.id, buildLocalSignature(next));
          applyRemoteBookMergeRef.current(book.id, next);
        } catch (downloadError: any) {
          Sentry.addBreadcrumb({
            category: 'reader-sync',
            level: 'warning',
            message: 'original file hydration failed',
            data: { bookId: book.id, code: downloadError?.code ?? null },
          });
          // Allow a retry on next mount; don't keep the id in the in-flight set.
          originalFileHydrationsRef.current.delete(book.id);
        }
      })();
    });

    return () => {
      cancellations.forEach((cancel) => cancel());
    };
  }, [usersBooks, userId, books.isUsersBooksLoaded]);

  return useMemo(() => {
    const isInitialSyncing = Boolean(userId) && lastSyncIso === null && status !== 'error';
    return { status, lastSyncIso, error, isInitialSyncing };
  }, [status, lastSyncIso, error, userId]);
};

export const BooksSyncProvider = ({ children }: { children: ReactNode }) => {
  const value = useBooksSyncState();
  return <BooksSyncContext.Provider value={value}>{children}</BooksSyncContext.Provider>;
};

export const useBooksSync = (): BooksSyncContextValue => useContext(BooksSyncContext);
