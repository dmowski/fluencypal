'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { AddBookModal } from './AddBookModal';
import { BookCard, AddNewBookCard } from './Cards';
import { Book } from './types';
import { useBooks } from './useBooks';

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
          <Typography sx={{}}>{i18n._('Your books')}:</Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {books.usersBooks.map((book, index) => (
              <BookCard
                key={`${book.title}-${index}`}
                data={book}
                onClick={books.setActive}
                onDelete={handleDelete}
              />
            ))}

            <AddNewBookCard onClick={() => setIsAddModalOpen(true)} />
          </Stack>
        </Stack>

        <Stack
          sx={{
            gap: '5px',
          }}
        >
          <Typography sx={{}}>{i18n._('Demo books')}:</Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {books.testBooks.map((book) => (
              <BookCard key={book.title} data={book} onClick={books.setActive} />
            ))}
          </Stack>
        </Stack>
      </Stack>

      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </Stack>
  );
};
