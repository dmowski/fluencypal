import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { testData } from './testData';
import { Book, HighlightedText } from './types';
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

  const persistUsersBooks = async (nextBooks: Book[]) => {
    if (!isUsersBooksLoaded) return;
    await saveUsersBooksToIndexedDb(nextBooks);
  };

  const addBook = async ({
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
      activePageIndex: 1,
    };
    const nextBooks = [...usersBooks, newBook];
    setUsersBooks(nextBooks);
    setActive(newBook);
    await persistUsersBooks(nextBooks);
  };

  const deleteBook = (bookToDelete: Book) => {
    setUsersBooks((prev) => {
      const nextBooks = prev.filter((book) => book !== bookToDelete);
      void persistUsersBooks(nextBooks);
      return nextBooks;
    });
    setActive((prev) => (prev === bookToDelete ? null : prev));
  };

  const updateActiveBook = (updater: (book: Book) => Book) => {
    setActive((prevActive) => {
      if (!prevActive) return prevActive;

      const nextActive = updater(prevActive);
      setUsersBooks((prevBooks) => {
        const nextBooks = prevBooks.map((book) => (book === prevActive ? nextActive : book));
        void persistUsersBooks(nextBooks);
        return nextBooks;
      });

      return nextActive;
    });
  };

  const applySelectedHighlight = (highlight: HighlightedText) => {
    updateActiveBook((book) => ({
      ...book,
      highlights: [...(book.highlights ?? []), { ...highlight, note: highlight.note ?? '' }],
    }));
  };

  const removeHighlight = (highlight: HighlightedText) => {
    updateActiveBook((book) => ({
      ...book,
      highlights: (book.highlights ?? []).filter(
        (h) =>
          !(
            h.paragraphIndex === highlight.paragraphIndex &&
            h.startIndex === highlight.startIndex &&
            h.endIndex === highlight.endIndex &&
            h.color === highlight.color
          ),
      ),
    }));
  };

  const setActivePage = (activePageIndex: number) => {
    updateActiveBook((book) => ({
      ...book,
      activePageIndex,
    }));
  };

  return {
    active,
    activePage: active?.activePageIndex ?? 1,
    setActive,
    setActivePage,
    addBook,
    deleteBook,
    applySelectedHighlight,
    removeHighlight,
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
