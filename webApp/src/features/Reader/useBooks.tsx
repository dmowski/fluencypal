import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { testData } from './testData';
import { Book, HighlightedText } from './types';
import { splitTextIntoParagraphs } from './splitParagraphsIntoPages';
import {
  deleteUserBookFromIndexedDb,
  loadUsersBooksFromIndexedDb,
  saveUserBookToIndexedDb,
} from './booksIndexedDb';

type BooksContextType = ReturnType<typeof useBooksState>;

const BooksContext = createContext<BooksContextType | null>(null);

const createBookId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `book-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const resolveBookUpdate = (
  book: Book,
  updates: Partial<Book> | ((currentBook: Book) => Partial<Book>),
): Book => ({
  ...book,
  ...(typeof updates === 'function' ? updates(book) : updates),
});

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

  const persistUserBook = async (book: Book) => {
    if (!isUsersBooksLoaded) return;
    await saveUserBookToIndexedDb(book);
  };

  const removePersistedBook = async (bookId: string) => {
    if (!isUsersBooksLoaded) return;
    await deleteUserBookFromIndexedDb(bookId);
  };

  const updateBook = (
    bookId: string,
    updates: Partial<Book> | ((currentBook: Book) => Partial<Book>),
  ) => {
    setUsersBooks((prevBooks) => {
      let updatedBook: Book | null = null;
      const nextBooks = prevBooks.map((book) => {
        if (book.id !== bookId) return book;

        updatedBook = resolveBookUpdate(book, updates);
        return updatedBook;
      });

      if (updatedBook) {
        void persistUserBook(updatedBook);
      }

      return nextBooks;
    });

    setActive((prevActive) => {
      if (!prevActive || prevActive.id !== bookId) return prevActive;
      return resolveBookUpdate(prevActive, updates);
    });
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
      id: createBookId(),
      title,
      subtitle: subTitle,
      category: category,
      paragraphs: splitTextIntoParagraphs(text),
      activePageIndex: 1,
    };
    setUsersBooks((prev) => [...prev, newBook]);
    setActive(newBook);
    await persistUserBook(newBook);
  };

  const deleteBook = (bookToDelete: Book) => {
    setUsersBooks((prev) => {
      const nextBooks = prev.filter((book) => book.id !== bookToDelete.id);
      void removePersistedBook(bookToDelete.id);
      return nextBooks;
    });
    setActive((prev) => (prev?.id === bookToDelete.id ? null : prev));
  };

  const updateActiveBook = (updates: Partial<Book> | ((currentBook: Book) => Partial<Book>)) => {
    if (!active) return;
    updateBook(active.id, updates);
  };

  const applySelectedHighlight = (highlight: HighlightedText) => {
    updateActiveBook((book) => ({
      highlights: [...(book.highlights ?? []), { ...highlight, note: highlight.note ?? '' }],
    }));
  };

  const removeHighlight = (highlight: HighlightedText) => {
    updateActiveBook((book) => ({
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
    updateActiveBook({ activePageIndex });
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
