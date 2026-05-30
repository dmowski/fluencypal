import { MutableRefObject } from 'react';
import { Book } from '../../model/types';

export type BooksSyncStatus = 'idle' | 'syncing' | 'error';

export interface BooksSyncContextValue {
  status: BooksSyncStatus;
  lastSyncIso: string | null;
  error: string | null;
  isInitialSyncing: boolean;
  /**
   * Marks a book as "left" (non-owner self-removal) so the push-sync layer
   * skips the Firestore delete, removes it from local state immediately, and
   * calls the provided direct Firestore write.
   */
  markBookAsLeft: (bookId: string) => void;
}

/**
 * Bag of refs shared between the four sync hooks. Refs (rather than props or
 * context) so that long-lived async closures (Firestore `onSnapshot`,
 * debounced uploads, in-flight downloads) always read the freshest state
 * without re-subscribing.
 */
export interface BooksSyncRefs {
  /** Ids the server has shown us at least once — used to detect deletions. */
  knownRemoteIds: MutableRefObject<Set<string>>;
  /** Last-known original-file blob path per book, for cleanup on delete. */
  knownOriginalPaths: MutableRefObject<Map<string, string>>;
  /** When a remote merge writes locally, suppress the next echo push. */
  suppressedSignatures: MutableRefObject<Map<string, string>>;
  /** Last signature we successfully pushed, to skip no-op pushes. */
  lastPushedSignatures: MutableRefObject<Map<string, string>>;
  /** Last highlights timestamp pushed, to fast-path immediate pushes. */
  lastPushedHighlightsIso: MutableRefObject<Map<string, string | null>>;
  /** Last sharing fingerprint pushed, to fast-path immediate pushes. */
  lastPushedSharingSig: MutableRefObject<Map<string, string>>;
  /** Per-book debounce timers for push. */
  pushTimers: MutableRefObject<Map<string, ReturnType<typeof setTimeout>>>;
  /** Per-book in-flight push guard so concurrent edits collapse safely. */
  inFlightUploads: MutableRefObject<Set<string>>;
  /** Book ids that changed while a push was in flight and need a follow-up push. */
  pendingPushAfterUpload: MutableRefObject<Set<string>>;
  /** Cached `createdAtIso` per book to keep it stable across pushes. */
  createdAtCache: MutableRefObject<Map<string, string>>;
  /** Per-book locks for the eager EPUB hydration effect. */
  originalFileHydrations: MutableRefObject<Set<string>>;
  /** Per-book locks for the lazy paragraphs hydration effect. */
  paragraphsHydrations: MutableRefObject<Set<string>>;
  /** Always points at the latest `usersBooks` array. */
  usersBooks: MutableRefObject<Book[]>;
  /** Always points at the latest `applyRemoteBookMerge`. */
  applyRemoteBookMerge: MutableRefObject<(bookId: string, next: Book) => void>;
  /** Always points at the latest `removeBookLocally`. */
  removeBookLocally: MutableRefObject<(bookId: string) => void>;
  /**
   * Book ids that were removed from local state by a "leave" operation (the
   * user removed themselves from a shared book). usePushSync must skip the
   * Firestore delete for these — the Firestore write was already done directly.
   */
  leavedBookIds: MutableRefObject<Set<string>>;
}

export interface BooksSyncStatusSetters {
  setStatus: (status: BooksSyncStatus) => void;
  setLastSyncIso: (iso: string) => void;
  setError: (message: string) => void;
}

export const PUSH_DEBOUNCE_MS = 800;
