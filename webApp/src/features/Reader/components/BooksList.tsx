'use client';

import { LinearProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { AddBookModal } from './AddBookModal';
import { BookCard, AddNewBookCard } from './Cards';
import { useBooks } from '../hooks/useBooks';
import { Book } from '../model/types';
import { DevPanel } from './DevPanel';
import { useDroppedEpubImport } from '../hooks/useDroppedEpubImport';
import { useBooksListDropZone } from '../hooks/useBooksListDropZone';

export const BooksList = () => {
  const i18n = useLingui();
  const books = useBooks();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isImportingDroppedFile, importProgress, importMessage, importError, importDroppedFile } =
    useDroppedEpubImport();
  const { isDropActive, handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useBooksListDropZone({
      isDisabled: isAddModalOpen,
      onDropFile: importDroppedFile,
    });

  const handleDelete = (book: Book) => {
    if (!window.confirm(i18n._('Delete this book?'))) return;
    books.deleteBook(book);
  };

  return (
    <Stack
      sx={{
        width: '100%',
        padding: '32px',
        minHeight: '100dvh',
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

            <AddNewBookCard onClick={() => setIsAddModalOpen(true)} />
          </Stack>
        </Stack>
      </Stack>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isGlobalDropActive={isDropActive}
      />
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
