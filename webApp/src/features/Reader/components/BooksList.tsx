'use client';

import { LinearProgress, Stack, Typography } from '@mui/material';
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
import {
  downloadReaderLibraryBookFile,
  formatLibraryBookDownloadCaption,
} from '../api/libraryRequests';

const FALLBACK_LIBRARY_ERROR = 'Failed to download library book.';

export const BooksList = () => {
  const i18n = useLingui();
  const books = useBooks();
  const library = useReaderLibrary();
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
          gap: '32px',
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
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'serif',
          }}
        >
          {i18n._('Books')}
        </Typography>

        <Stack sx={{ gap: '12px' }}>
          <Typography variant="h4">{i18n._('My books')}</Typography>

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

        {isImportingDroppedFile || importProgress > 0 ? (
          <Stack sx={{ gap: '6px', maxWidth: '420px' }} data-testid="books-drop-import-progress">
            <LinearProgress variant="determinate" value={importProgress} />
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {importMessage}
            </Typography>
          </Stack>
        ) : null}
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

        <Stack data-testid="reader-library-section" sx={{ gap: '20px' }}>
          <Typography variant="h4">{i18n._('Library')}</Typography>

          {library.isLoading ? (
            <Typography variant="caption">{i18n._('Loading library...')}</Typography>
          ) : null}
          {library.error ? (
            <Typography variant="caption" color="error" data-testid="reader-library-error">
              {library.error}
            </Typography>
          ) : null}

          {library.categories.map((category) => (
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
                {category.books.map((book) => (
                  <LibraryBookCard
                    key={`${category.id}-${book.ebookId}`}
                    data={book}
                    onClick={() => {
                      void handleLibraryBookClick(book);
                    }}
                    isDisabled={isBusy}
                    isLoading={isDownloadingLibraryBookId === book.ebookId}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <DevPanel />

      {isDownloadingLibraryBookId ? (
        <Stack
          data-testid="library-download-fixed-panel"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100vw',
            height: '30px',
            zIndex: 1100,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.22)',
            justifyContent: 'center',
          }}
        >
          <LinearProgress
            variant="determinate"
            value={libraryDownloadProgress}
            sx={{
              position: 'absolute',
              inset: 0,
              height: '100%',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ffb300',
              },
            }}
          />
          <Typography
            variant="caption"
            data-testid="library-download-status"
            sx={{
              position: 'relative',
              zIndex: 1,
              color: '#fff',
              lineHeight: '30px',
              textAlign: 'center',
              px: '8px',
              fontWeight: 600,
              textShadow: '0 1px 1px rgba(0,0,0,0.8)',
            }}
          >
            {libraryDownloadLabel || i18n._('Downloading book from Project Gutenberg...')}
          </Typography>
        </Stack>
      ) : null}

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
