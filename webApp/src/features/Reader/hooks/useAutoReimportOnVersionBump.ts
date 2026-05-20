'use client';

import { useEffect, useRef } from 'react';
import { useBooks } from './useBooks';
import { useReimportEpub } from './useReimportEpub';
import { EPUB_PARSER_VERSION } from '../utils/epubImport';

/**
 * Walks the loaded books and triggers a one-shot automatic re-import for any
 * book whose `epubParserVersion` is older than the current `EPUB_PARSER_VERSION`
 * (or missing entirely on legacy books). Skipping is automatic when there is
 * no local EPUB and no synced `convertedFiles.epub` to download from.
 *
 * Runs one re-import at a time to avoid hammering the parser on first load.
 */
export const useAutoReimportOnVersionBump = (): void => {
  const books = useBooks();
  const { reimportBook, canReimportAutomatically, isReimporting } = useReimportEpub();
  const handledIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isReimporting) return;

    const stale = books.usersBooks.find((book) => {
      if (handledIds.current.has(book.id)) return false;
      if (book.epubParserVersion === EPUB_PARSER_VERSION) return false;
      if (!canReimportAutomatically(book)) return false;
      return true;
    });

    if (!stale) return;

    handledIds.current.add(stale.id);
    void reimportBook(stale);
  }, [books.usersBooks, isReimporting, reimportBook, canReimportAutomatically]);
};
