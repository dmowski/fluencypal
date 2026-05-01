import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { testData } from './testData';
import { Book } from './types';
import { splitTextIntoParagraphs } from './splitParagraphsIntoPages';
import { loadUsersBooksFromIndexedDb, saveUsersBooksToIndexedDb } from './booksIndexedDb';

type BooksContextType = ReturnType<typeof useBooksState>;

const BooksContext = createContext<BooksContextType | null>(null);

const useBooksState = () => {
  const [active, setActive] = useState<Book | null>(null);
  const [usersBooks, setUsersBooks] = useState<Book[]>([]);
  const [isUsersBooksLoaded, setIsUsersBooksLoaded] = useState(false);
  const testBooks = [testData];

  useEffect(() => {
    let isCancelled = false;

    const loadBooks = async () => {
      const booksFromDb = await loadUsersBooksFromIndexedDb();
      if (!isCancelled) {
        setUsersBooks(booksFromDb);
        setIsUsersBooksLoaded(true);
      }
    };

    loadBooks().catch(() => {
      if (!isCancelled) {
        setIsUsersBooksLoaded(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isUsersBooksLoaded) return;
    saveUsersBooksToIndexedDb(usersBooks).catch(() => {});
  }, [isUsersBooksLoaded, usersBooks]);

  const addBook = ({
    title,
    subTitle,
    text,
    category,
  }: {
    title: string;
    subTitle: string;
    text: string;
    category: string;
  }) => {
    const newBook: Book = {
      title,
      subtitle: subTitle,
      category: category,
      paragraphs: splitTextIntoParagraphs(text),
    };
    setUsersBooks((prev) => [...prev, newBook]);
    setActive(newBook);
  };

  const deleteBook = (bookToDelete: Book) => {
    setUsersBooks((prev) => prev.filter((book) => book !== bookToDelete));
    setActive((prev) => (prev === bookToDelete ? null : prev));
  };

  return {
    active,
    setActive,
    addBook,
    deleteBook,
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
