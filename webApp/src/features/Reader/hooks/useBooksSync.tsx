'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useBooks } from './useBooks';
import { useBooksSyncRefs } from './booksSync/useBooksSyncRefs';
import { useRemoteSubscription } from './booksSync/useRemoteSubscription';
import { usePushSync } from './booksSync/usePushSync';
import { useParagraphsHydration } from './booksSync/useParagraphsHydration';
import { useOriginalFileHydration } from './booksSync/useOriginalFileHydration';
import { BooksSyncContextValue, BooksSyncStatus, BooksSyncStatusSetters } from './booksSync/types';

export type { BooksSyncStatus } from './booksSync/types';

const BooksSyncContext = createContext<BooksSyncContextValue>({
  status: 'idle',
  lastSyncIso: null,
  error: null,
  isInitialSyncing: false,
  markBookAsLeft: () => {},
});

/**
 * Composes the four reader-sync sub-hooks behind a single context value:
 *   1. `useRemoteSubscription` — Firestore → local
 *   2. `usePushSync`           — local → Firestore (+ blob uploads + delete)
 *   3. `useParagraphsHydration`— Storage → local (lazy, when book opens)
 *   4. `useOriginalFileHydration` — Storage → local (eager, all books)
 *
 * Stability comes from a shared `BooksSyncRefs` bag whose entries are
 * created once and updated in place — long-lived async closures
 * (snapshot handler, debounced uploads, in-flight downloads) read fresh
 * state without re-binding.
 */
const useBooksSyncState = (): BooksSyncContextValue => {
  const auth = useAuth();
  const books = useBooks();
  const userId = auth.uid || null;

  const [status, setStatus] = useState<BooksSyncStatus>('idle');
  const [lastSyncIso, setLastSyncIso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setters: BooksSyncStatusSetters = useMemo(
    () => ({ setStatus, setLastSyncIso, setError }),
    [],
  );

  const refs = useBooksSyncRefs(
    books.usersBooks,
    books.applyRemoteBookMerge,
    books.removeBookLocally,
  );

  useRemoteSubscription({
    userId,
    isUsersBooksLoaded: books.isUsersBooksLoaded,
    refs,
    setters,
  });

  usePushSync({
    userId,
    isUsersBooksLoaded: books.isUsersBooksLoaded,
    hasReceivedInitialSnapshot: lastSyncIso !== null,
    usersBooks: books.usersBooks,
    applyRemoteBookMerge: books.applyRemoteBookMerge,
    refs,
    setters,
  });

  useParagraphsHydration({
    userId,
    active: books.active,
    applyRemoteBookMerge: books.applyRemoteBookMerge,
    refs,
    setters,
  });

  useOriginalFileHydration({
    userId,
    isUsersBooksLoaded: books.isUsersBooksLoaded,
    usersBooks: books.usersBooks,
    refs,
  });

  return useMemo(() => {
    const isInitialSyncing = Boolean(userId) && lastSyncIso === null && status !== 'error';
    return {
      status,
      lastSyncIso,
      error,
      isInitialSyncing,
      markBookAsLeft: (bookId: string) => {
        refs.leavedBookIds.current.add(bookId);
      },
    };
  }, [status, lastSyncIso, error, userId, refs]);
};

export const BooksSyncProvider = ({ children }: { children: ReactNode }) => {
  const value = useBooksSyncState();
  return <BooksSyncContext.Provider value={value}>{children}</BooksSyncContext.Provider>;
};

export const useBooksSync = (): BooksSyncContextValue => useContext(BooksSyncContext);
