import { useEffect } from 'react';
import { onSnapshot, query, where } from 'firebase/firestore';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/features/Firebase/firebaseDb';
import { buildStubBookFromRemote, mergeRemoteBookIntoLocal } from '../booksSyncMerge';
import { migrateRemoteDoc } from '../../utils/migrateBookData';
import { buildLocalSignature } from './signature';
import { errorLog, log } from './log';
import { BooksSyncRefs, BooksSyncStatusSetters } from './types';

interface Args {
  userId: string | null;
  isUsersBooksLoaded: boolean;
  refs: BooksSyncRefs;
  setters: BooksSyncStatusSetters;
}

/**
 * Subscribes to the user's `readerBooks` Firestore collection and reconciles
 * each snapshot into local state via the merge helpers. Long-lived: only
 * resubscribes when the user or initial-hydration flag changes.
 */
export const useRemoteSubscription = ({
  userId,
  isUsersBooksLoaded,
  refs,
  setters,
}: Args): void => {
  useEffect(() => {
    if (!userId) {
      refs.knownRemoteIds.current = new Set();
      refs.knownOriginalPaths.current = new Map();
      refs.suppressedSignatures.current = new Map();
      refs.lastPushedSignatures.current = new Map();
      refs.createdAtCache.current = new Map();
      return;
    }
    // Wait for the local IndexedDB hydration before subscribing — otherwise
    // the first snapshot races the local load, sees no `local` match, and
    // persists a stub WITHOUT `imagesByHref` / `epubFile`, permanently
    // overwriting the local copy in IndexedDB.
    if (!isUsersBooksLoaded) return;

    const collectionRef = db.collections.readerBooks();
    if (!collectionRef) return;

    // Query only books where this user is a member (owner or collaborator).
    // `memberIds` is a denormalized [ownerUserId, ...userIds] array kept in
    // sync by the push side so this array-contains query works correctly.
    const memberQuery = query(collectionRef, where('memberIds', 'array-contains', userId));

    log('subscribing to books', { userId });
    setters.setStatus('syncing');

    const unsubscribe = onSnapshot(
      memberQuery,
      (snapshot) => {
        log('snapshot received', {
          docCount: snapshot.docs.length,
          ids: snapshot.docs.map((d) => d.id),
        });
        const seenIds = new Set<string>();

        snapshot.docs.forEach((docSnap) => {
          const remote = migrateRemoteDoc(docSnap.data());
          seenIds.add(remote.id);
          refs.createdAtCache.current.set(remote.id, remote.createdAtIso);
          if (remote.convertedFiles?.epub) {
            refs.knownOriginalPaths.current.set(remote.id, remote.convertedFiles.epub);
          }

          const local = refs.usersBooks.current.find((book) => book.id === remote.id);
          if (!local) {
            const stub = buildStubBookFromRemote(remote);
            log('hydrating stub from remote', {
              bookId: stub.id,
              hasParagraphsBlob: !!stub.paragraphsBlobPath,
              hasEpubBlob: !!stub.convertedFiles.epub,
            });
            refs.suppressedSignatures.current.set(stub.id, buildLocalSignature(stub));
            refs.applyRemoteBookMerge.current(stub.id, stub);
            return;
          }

          const merged = mergeRemoteBookIntoLocal(local, remote);
          if (merged) {
            log('merging remote into local', {
              bookId: merged.id,
              highlightsCount: merged.highlights?.length ?? 0,
              hasImages: !!merged.imagesByHref && Object.keys(merged.imagesByHref).length > 0,
            });
            refs.suppressedSignatures.current.set(merged.id, buildLocalSignature(merged));
            refs.applyRemoteBookMerge.current(merged.id, merged);
          }
        });

        // Remote deletions: ids we knew about but didn't receive this snapshot.
        refs.knownRemoteIds.current.forEach((id) => {
          if (!seenIds.has(id)) refs.removeBookLocally.current(id);
        });

        refs.knownRemoteIds.current = seenIds;
        setters.setStatus('idle');
        setters.setLastSyncIso(new Date().toISOString());
      },
      (snapshotError) => {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'error',
          message: 'readerBooks subscription error',
          data: { code: (snapshotError as { code?: string }).code ?? null },
        });
        Sentry.captureException(snapshotError, {
          tags: { area: 'reader-sync', op: 'subscribe' },
        });
        errorLog('subscription error', undefined, snapshotError);
        setters.setStatus('error');
        setters.setError(snapshotError.message);
      },
    );

    return () => {
      unsubscribe();
      refs.pushTimers.current.forEach(clearTimeout);
      refs.pushTimers.current.clear();
    };
    // `refs` and `setters` are stable refs/setters, not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isUsersBooksLoaded]);
};
