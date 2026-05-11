import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Book } from '../../model/types';
import { downloadParagraphsBlob } from '../../server/readerStorage';
import { buildLocalSignature } from './signature';
import { errorLog, getErrorCode, getErrorMessage, log, warn } from './log';
import { BooksSyncRefs, BooksSyncStatusSetters } from './types';

interface Args {
  userId: string | null;
  active: Book | null;
  applyRemoteBookMerge: (bookId: string, next: Book) => void;
  refs: BooksSyncRefs;
  setters: BooksSyncStatusSetters;
}

/**
 * When the active book is a remote stub (no paragraphs but a blob path),
 * downloads the gzipped paragraphs.json from Storage and merges it locally.
 * Per-book lock survives remounts so a re-render mid-download doesn't
 * relaunch the request.
 */
export const useParagraphsHydration = ({
  userId,
  active,
  applyRemoteBookMerge,
  refs,
  setters,
}: Args): void => {
  const activeId = active?.id ?? null;
  const activeParagraphsBlobPath = active?.paragraphsBlobPath ?? null;
  const activeParagraphsCount = active?.paragraphs.length ?? 0;

  useEffect(() => {
    if (!userId) return;
    if (!active) return;
    if (active.paragraphs.length > 0) return;
    if (!active.paragraphsBlobPath) return;
    if (refs.paragraphsHydrations.current.has(active.id)) return;

    refs.paragraphsHydrations.current.add(active.id);

    (async () => {
      log('hydrating paragraphs from Storage', {
        bookId: active.id,
        path: active.paragraphsBlobPath,
      });
      try {
        const paragraphs = await downloadParagraphsBlob({ bookId: active.id });
        if (!paragraphs) {
          warn('paragraphs blob not found', { bookId: active.id });
          return;
        }
        const latest = refs.usersBooks.current.find((entry) => entry.id === active.id) ?? active;
        log('paragraphs hydrated', { bookId: active.id, count: paragraphs.length });
        const next: Book = { ...latest, paragraphs };
        refs.suppressedSignatures.current.set(active.id, buildLocalSignature(next));
        applyRemoteBookMerge(active.id, next);
      } catch (downloadError) {
        Sentry.addBreadcrumb({
          category: 'reader-sync',
          level: 'error',
          message: 'paragraphs download failed',
          data: { bookId: active.id, code: getErrorCode(downloadError) },
        });
        Sentry.captureException(downloadError, {
          tags: { area: 'reader-sync', op: 'downloadParagraphs' },
        });
        errorLog('paragraphs download failed', { bookId: active.id }, downloadError);
        setters.setError(getErrorMessage(downloadError));
        // Allow a retry on next attempt.
        refs.paragraphsHydrations.current.delete(active.id);
      }
    })();
    // We re-run only when the *identity* of the active book changes or when
    // its blob pointer/paragraph count flips. `active` itself is excluded to
    // avoid retriggering on every position update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeId, activeParagraphsBlobPath, activeParagraphsCount]);
};
