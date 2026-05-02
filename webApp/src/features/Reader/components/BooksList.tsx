'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { AddBookModal } from './AddBookModal';
import { BookCard, AddNewBookCard } from './Cards';
import { useBooks } from '../hooks/useBooks';
import { Book } from '../model/types';

export const BooksList = () => {
  const i18n = useLingui();
  const books = useBooks();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = (book: Book) => {
    if (!window.confirm(i18n._('Delete this book?'))) return;
    books.deleteBook(book);
  };

  return (
    <Stack
      sx={{
        width: '100%',
        padding: '32px',
      }}
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

      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </Stack>
  );
};
