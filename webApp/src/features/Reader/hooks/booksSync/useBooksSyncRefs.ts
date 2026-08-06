import { useRef } from 'react';
import { Book } from '../../model/types';
import { BooksSyncRefs } from './types';

/**
 * Allocates the long-lived ref bag and keeps the "latest snapshot" refs
 * (`usersBooks`, `applyRemoteBookMerge`, `removeBookLocally`) in sync with
 * the current render. Returning the same `BooksSyncRefs` identity across
 * renders is required so subscriber/uploader closures don't re-bind.
 */
export const useBooksSyncRefs = (
  usersBooks: Book[],
  applyRemoteBookMerge: (bookId: string, next: Book) => void,
  removeBookLocally: (bookId: string) => void,
): BooksSyncRefs => {
  const refs = useRef<BooksSyncRefs | null>(null);

  if (refs.current === null) {
    refs.current = {
      knownRemoteIds: { current: new Set<string>() },
      knownOriginalPaths: { current: new Map<string, string>() },
      suppressedSignatures: { current: new Map<string, string>() },
      lastPushedSignatures: { current: new Map<string, string>() },
      lastPushedHighlightsIso: { current: new Map<string, string | null>() },
      lastPushedSharingSig: { current: new Map<string, string>() },
      pushTimers: { current: new Map() },
      inFlightUploads: { current: new Set<string>() },
      pendingPushAfterUpload: { current: new Set<string>() },
      pushTransientRetryCounts: { current: new Map<string, number>() },
      pushRetryTimers: { current: new Map() },
      createdAtCache: { current: new Map<string, string>() },
      originalFileHydrations: { current: new Set<string>() },
      paragraphsHydrations: { current: new Set<string>() },
      usersBooks: { current: usersBooks },
      applyRemoteBookMerge: { current: applyRemoteBookMerge },
      removeBookLocally: { current: removeBookLocally },
      leavedBookIds: { current: new Set<string>() },
    };
  }

  // Keep the "latest snapshot" refs fresh on every render.
  refs.current.usersBooks.current = usersBooks;
  refs.current.applyRemoteBookMerge.current = applyRemoteBookMerge;
  refs.current.removeBookLocally.current = removeBookLocally;

  return refs.current;
};
