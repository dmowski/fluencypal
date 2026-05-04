'use client';

import { LinearProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ChangeEvent, useRef } from 'react';
import { BookCard, AddNewBookCard } from './Cards';
import { useBooks } from '../hooks/useBooks';
import { Book } from '../model/types';
import { DevPanel } from './DevPanel';
import { useDroppedEpubImport } from '../hooks/useDroppedEpubImport';
import { useBooksListDropZone } from '../hooks/useBooksListDropZone';

export const BooksList = () => {
  const i18n = useLingui();
  const books = useBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isImportingDroppedFile, importProgress, importMessage, importError, importEpubFile } =
    useDroppedEpubImport();
  const { isDropActive, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useBooksListDropZone({
      isDisabled: isImportingDroppedFile,
      onDropFile: importEpubFile,
    });

  const handleAddBookClick = () => {
    if (isImportingDroppedFile) return;
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

        <Stack
          sx={{
            gap: '5px',
          }}
        >
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

            <AddNewBookCard onClick={handleAddBookClick} isDisabled={isImportingDroppedFile} />
          </Stack>
        </Stack>
      </Stack>
      <DevPanel />

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
