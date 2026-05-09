'use client';

import { Button, Stack, Typography } from '@mui/material';
import { ImportProgressPanel } from './ImportProgressPanel';
import { useLingui } from '@lingui/react';
import { ChangeEvent, useRef, useState } from 'react';
import { BookCard, AddNewBookCard, LibraryBookCard } from './Cards';
import { useBooks } from '../hooks/useBooks';
import { Book } from '../model/types';
import { ReaderLibraryBook } from '../model/library';
import { DevPanel } from './DevPanel';
import { useDroppedEpubImport } from '../hooks/useDroppedEpubImport';
import { useBooksListDropZone } from '../hooks/useBooksListDropZone';
import { useReaderLibrary } from '../hooks/useReaderLibrary';
import { useBooksSync } from '../hooks/useBooksSync';
import {
  downloadReaderLibraryBookFile,
  formatLibraryBookDownloadCaption,
} from '../api/libraryRequests';
import { useUrlState } from '@/features/Url/useUrlState';
import { ReaderSignInModal } from './ReaderSignInModal';
import { ReaderAuthButton } from './ReaderAuthButton';

const FALLBACK_LIBRARY_ERROR = 'Failed to download library book.';

export const BooksList = () => {
  const i18n = useLingui();
  const books = useBooks();
  const library = useReaderLibrary();
  const sync = useBooksSync();
  const [isProfileOpen, setIsProfileOpen] = useUrlState('profile', false, false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isImportingDroppedFile, importProgress, importMessage, importError, importEpubFile } =
    useDroppedEpubImport();
  const [isDownloadingLibraryBookId, setIsDownloadingLibraryBookId] = useState<string | null>(null);
  const [libraryDownloadProgress, setLibraryDownloadProgress] = useState(0);
  const [libraryDownloadLabel, setLibraryDownloadLabel] = useState('');
  const [libraryImportError, setLibraryImportError] = useState('');
  const { isDropActive, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useBooksListDropZone({
      isDisabled: isImportingDroppedFile,
      onDropFile: importEpubFile,
    });
  const isBusy = isImportingDroppedFile || isDownloadingLibraryBookId !== null;

  const handleAddBookClick = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleEpubSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await importEpubFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (book: Book) => {
    if (!window.confirm(i18n._('Delete this book?'))) return;
    books.deleteBook(book);
  };

  const handleLibraryBookClick = async (book: ReaderLibraryBook) => {
    if (isBusy) return;

    try {
      setIsDownloadingLibraryBookId(book.ebookId);
      setLibraryDownloadProgress(0);
      setLibraryDownloadLabel(formatLibraryBookDownloadCaption(book, 0));
      setLibraryImportError('');

      const epubFile = await downloadReaderLibraryBookFile({
        ebookId: book.ebookId,
        title: book.title,
        onProgress: ({ progress }) => {
          setLibraryDownloadProgress(progress);
          setLibraryDownloadLabel(formatLibraryBookDownloadCaption(book, progress));
        },
      });

      setIsDownloadingLibraryBookId(null);
      await importEpubFile(epubFile);
    } catch (error) {
      setLibraryImportError(
        error instanceof Error ? error.message : i18n._(FALLBACK_LIBRARY_ERROR),
      );
    } finally {
      setIsDownloadingLibraryBookId(null);
      setLibraryDownloadProgress(0);
      setLibraryDownloadLabel('');
    }
  };

  return (
    <Stack
      data-testid="books-list-drop-target"
      sx={{
        width: '100%',
        padding: '32px',
        minHeight: '100dvh',
        '@media (max-width: 600px)': {
          padding: '16px',
        },
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Stack
        sx={{
          gap: '72px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          style={{ display: 'none' }}
          onChange={(event) => {
            void handleEpubSelect(event);
          }}
          data-testid="add-book-file-input"
        />
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'serif',
            }}
          >
            {i18n._('Books')}
          </Typography>

          <ReaderAuthButton onClick={() => void setIsProfileOpen(true)} />
        </Stack>

        <ReaderSignInModal open={isProfileOpen} onClose={() => void setIsProfileOpen(false)} />

        <Stack sx={{ gap: '12px' }}>
          <Typography variant="h4">{i18n._('My books')}</Typography>

          {sync.isInitialSyncing && books.usersBooks.length === 0 ? (
            <Typography
              variant="caption"
              data-testid="reader-initial-sync-caption"
              sx={{ opacity: 0.7 }}
            >
              {i18n._('Syncing your library…')}
            </Typography>
          ) : null}

          <Stack
            sx={{
              flexDirection: 'row',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {books.usersBooks.map((book) => (
              <BookCard
                key={book.id}
                data={book}
                onClick={() => books.setActive(book.id)}
                onDelete={handleDelete}
              />
            ))}

            <AddNewBookCard onClick={handleAddBookClick} isDisabled={isBusy} />
          </Stack>
        </Stack>

        {importError ? (
          <Typography variant="caption" color="error" data-testid="books-drop-import-error">
            {importError}
          </Typography>
        ) : null}
        {libraryImportError ? (
          <Typography variant="caption" color="error" data-testid="library-import-error">
            {libraryImportError}
          </Typography>
        ) : null}

        <Stack data-testid="reader-library-section" sx={{ gap: '50px' }}>
          <Typography variant="h4">{i18n._('Library')}</Typography>

          {library.isLoading ? (
            <Typography variant="caption">{i18n._('Loading library...')}</Typography>
          ) : null}
          {library.error ? (
            <Typography variant="caption" color="error" data-testid="reader-library-error">
              {library.error}
            </Typography>
          ) : null}

          {library.categories.map((category, categoryIndex) => (
            <Stack
              key={category.id}
              data-testid={`reader-library-category-${category.id}`}
              sx={{ gap: '12px' }}
            >
              <Typography variant="h5">{category.title}</Typography>
              <Stack
                sx={{
                  flexDirection: 'row',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {category.books.map((book, bookIndex) => (
                  <LibraryBookCard
                    key={`${category.id}-${book.ebookId}`}
                    data={book}
                    onClick={() => {
                      void handleLibraryBookClick(book);
                    }}
                    isDisabled={isBusy}
                    isLoading={isDownloadingLibraryBookId === book.ebookId}
                    priority={categoryIndex === 0 && bookIndex === 0}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <DevPanel />

      <ImportProgressPanel
        isDownloading={isDownloadingLibraryBookId !== null}
        downloadProgress={libraryDownloadProgress}
        downloadLabel={libraryDownloadLabel}
        isImporting={isImportingDroppedFile}
        importProgress={importProgress}
        importMessage={importMessage}
      />

      {isDropActive ? (
        <Stack
          data-testid="books-list-drop-overlay"
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            border: '3px dashed rgba(255, 255, 255, 0.9)',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h4" sx={{ color: '#fff', textAlign: 'center', px: '16px' }}>
            {i18n._('Drop EPUB file to import book')}
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
};
