import { createContext, ReactNode, useContext, useState } from 'react';
import { testData } from './testData';
import { ReaderData } from './types';

type BooksContextType = ReturnType<typeof useBooksState>;

const BooksContext = createContext<BooksContextType | null>(null);

const useBooksState = () => {
  const [active, setActive] = useState<ReaderData | null>(null);
  const usersBooks: ReaderData[] = [];
  const testBooks = [testData];

  return {
    active,
    setActive,
    usersBooks,
    testBooks,
  };
};

export const BooksProvider = ({ children }: { children: ReactNode }) => {
  const books = useBooksState();
  return <BooksContext.Provider value={books}>{children}</BooksContext.Provider>;
};

export const useBooks = (): BooksContextType => {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
};
