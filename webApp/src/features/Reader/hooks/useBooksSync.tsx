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
  downloadParagraphsBlob,
  uploadOriginalFileBlob,
  uploadParagraphsBlob,
} from '../server/readerStorage';
export type BooksSyncStatus = 'idle' | 'syncing' | 'error';

interface BooksSyncContextValue {
  status: BooksSyncStatus;
  lastSyncIso: string | null;
  error: string | null;
}

const BooksSyncContext = createContext<BooksSyncContextValue>({
  status: 'idle',
  lastSyncIso: null,
  error: null,
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
  // Suppresses an immediate echo-push when a remote merge updates local state.
  const suppressedSignaturesRef = useRef<Map<string, string>>(new Map());
  const lastPushedSignaturesRef = useRef<Map<string, string>>(new Map());
  const pushTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlightUploadsRef = useRef<Set<string>>(new Set());
  const createdAtCacheRef = useRef<Map<string, string>>(new Map());

  const usersBooks = books.usersBooks;

  // ---- Subscribe to remote collection ---------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      knownRemoteIdsRef.current = new Set();
      suppressedSignaturesRef.current = new Map();
      lastPushedSignaturesRef.current = new Map();
      createdAtCacheRef.current = new Map();
      return;
    }

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

          const local = books.usersBooks.find((book) => book.id === remote.id);
          if (!local) {
            const stub = buildStubBookFromRemote(remote);
            suppressedSignaturesRef.current.set(stub.id, buildLocalSignature(stub));
            books.applyRemoteBookMerge(stub.id, stub);
            return;
          }

          const merged = mergeRemoteBookIntoLocal(local, remote);
          if (merged) {
            suppressedSignaturesRef.current.set(merged.id, buildLocalSignature(merged));
            books.applyRemoteBookMerge(merged.id, merged);
          }
        });

        // Remote deletions: ids we knew about but didn't receive this snapshot.
        knownRemoteIdsRef.current.forEach((id) => {
          if (!seenIds.has(id)) {
            books.removeBookLocally(id);
          }
        });

        knownRemoteIdsRef.current = seenIds;
        setStatus('idle');
        setLastSyncIso(new Date().toISOString());
      },
      (snapshotError) => {
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
  }, [userId]);

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
        }

        if (!originalFileBlobPath && book.originalFile) {
          originalFileBlobPath = await uploadOriginalFileBlob({
            userId,
            bookId: book.id,
            file: book.originalFile,
          });
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

        // Persist the storage pointers locally so we don't re-upload on every push.
        if (
          paragraphsBlobPath !== book.paragraphsBlobPath ||
          originalFileBlobPath !== book.originalFileBlobPath
        ) {
          books.applyRemoteBookMerge(book.id, {
            ...book,
            paragraphsBlobPath,
            originalFileBlobPath,
          });
        }

        setLastSyncIso(nowIso);
      } catch (pushError: any) {
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
    (book: Book) => {
      const timers = pushTimersRef.current;
      const existing = timers.get(book.id);
      if (existing) clearTimeout(existing);
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
        return;
      }
      const lastPushed = lastPushedSignaturesRef.current.get(book.id);
      if (lastPushed === signature) return;
      schedulePush(book);
    });

    // Detect locally-deleted books and remove the corresponding remote doc.
    const presentIds = new Set(usersBooks.map((book) => book.id));
    knownRemoteIdsRef.current.forEach((id) => {
      if (!presentIds.has(id)) {
        const docRef = db.documents.readerBook(userId, id);
        if (docRef) {
          void deleteDoc(docRef).catch((deleteError) => {
            console.error('[useBooksSync] delete error', deleteError);
          });
        }
        const paragraphsPath = `users/${userId}/reader/${id}/paragraphs.json.gz`;
        void deleteBookBlob(paragraphsPath).catch(() => undefined);
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

  return useMemo(() => ({ status, lastSyncIso, error }), [status, lastSyncIso, error]);
};

export const BooksSyncProvider = ({ children }: { children: ReactNode }) => {
  const value = useBooksSyncState();
  return <BooksSyncContext.Provider value={value}>{children}</BooksSyncContext.Provider>;
};

export const useBooksSync = (): BooksSyncContextValue => useContext(BooksSyncContext);
