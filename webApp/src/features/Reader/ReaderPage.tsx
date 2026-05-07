'use client';

import { Stack } from '@mui/material';
import { Reader } from './components/Reader';
import { ReaderPageStyle } from './components/style';
import { BooksProvider, useBooks } from './hooks/useBooks';
import { BooksList } from './components/BooksList';
import { ReaderSettingsProvider } from './hooks/useReaderSettings';
import { useDocumentTitle } from '@/libs/useDocumentTitle';

const ReaderComponent = () => {
  const books = useBooks();
  useDocumentTitle(books.active?.title);

  return (
    <Stack
      sx={{
        padding: '0',
        alignItems: 'center',
        height: '100%',
        flex: '1 1 1',
        backgroundColor: '#F4E1C6',
        color: '#000',
      }}
    >
      {!books.active && <BooksList />}
      {books.active && (
        <Stack
          sx={{
            minHeight: '500px',
            flex: '1 1 1',
            width: '100%',
          }}
        >
          <Reader data={books.active} />
        </Stack>
      )}
      <ReaderPageStyle />
    </Stack>
  );
};

export const ReaderPage = () => {
  return (
    <BooksProvider>
      <ReaderSettingsProvider>
        <ReaderComponent />
      </ReaderSettingsProvider>
    </BooksProvider>
  );
};
