import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { testData } from '../model/testData';
import { Book, BookChapterNavigationItem, HighlightedText, ReadingPosition } from '../model/types';
import { splitTextIntoParagraphs } from '../utils/splitParagraphsIntoPages';
import {
  deleteUserBookFromIndexedDb,
  loadUsersBooksFromIndexedDb,
  saveUserBookToIndexedDb,
} from '../utils/booksIndexedDb';
import { useUrlState } from '../../Url/useUrlState';

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

const testBooks = [testData];

const shouldSeedTestBooks = () =>
  typeof window !== 'undefined' && window.location.hostname === 'localhost';

const useBooksState = () => {
  const [activeBookId, setActiveBookId] = useUrlState<string | null>('activeBookId', null, true);

  const [usersBooks, setUsersBooks] = useState<Book[]>([]);

  const active = useMemo(
    () => usersBooks.find((book) => book.id === activeBookId) || null,
    [activeBookId, usersBooks],
  );
  const [isUsersBooksLoaded, setIsUsersBooksLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadBooks = async () => {
      const booksFromDb = await loadUsersBooksFromIndexedDb();
      const initialBooks =
        booksFromDb.length > 0 ? booksFromDb : shouldSeedTestBooks() ? testBooks : [];

      if (booksFromDb.length === 0 && initialBooks.length > 0) {
        await Promise.all(initialBooks.map((book) => saveUserBookToIndexedDb(book)));
      }

      if (!isCancelled) {
        setUsersBooks(initialBooks);
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

    setActiveBookId(bookId);
  };

  // Like updateBook but does NOT navigate to the book. For metadata-only changes
  // (e.g. sharing) where navigation is undesired.
  const patchBook = (
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
  };

  const reimportBook = (
    bookId: string,
    {
      title,
      subTitle,
      author,
      text,
      chapters,
      imagesByHref,
      imageAspectRatioByHref,
      originalFile,
    }: {
      title: string;
      subTitle: string;
      author: string;
      text: string;
      chapters?: BookChapterNavigationItem[];
      imagesByHref?: Record<string, string>;
      imageAspectRatioByHref?: Record<string, number>;
      originalFile?: File;
    },
  ) => {
    updateBook(bookId, (current) => ({
      title,
      subtitle: subTitle,
      author,
      paragraphs: splitTextIntoParagraphs(text),
      chapters,
      imagesByHref,
      imageAspectRatioByHref,
      originalFile: originalFile ?? current.originalFile,
      dataUpdatedAtIso: new Date().toISOString(),
    }));
  };

  const addBook = async ({
    title,
    subTitle,
    text,
    author,
    originalFile,
    chapters,
    imagesByHref,
    imageAspectRatioByHref,
  }: {
    title: string;
    subTitle: string;
    text: string;
    author: string;
    originalFile?: File;
    chapters?: BookChapterNavigationItem[];
    imagesByHref?: Record<string, string>;
    imageAspectRatioByHref?: Record<string, number>;
  }) => {
    const newBook: Book = {
      id: createBookId(),
      title,
      subtitle: subTitle,
      author,
      originalFile,
      chapters,
      imagesByHref,
      imageAspectRatioByHref,
      paragraphs: splitTextIntoParagraphs(text),
      activePageIndex: 1,
      dataUpdatedAtIso: new Date().toISOString(),
    };
    setUsersBooks((prev) => [...prev, newBook]);
    setActiveBookId(newBook.id);
    await persistUserBook(newBook);
  };

  const deleteBook = (bookToDelete: Book) => {
    setUsersBooks((prev) => {
      const nextBooks = prev.filter((book) => book.id !== bookToDelete.id);
      void removePersistedBook(bookToDelete.id);
      return nextBooks;
    });
    setActiveBookId(null);
  };

  const updateActiveBook = (updates: Partial<Book> | ((currentBook: Book) => Partial<Book>)) => {
    if (!active) return;
    updateBook(active.id, updates);
  };

  const applySelectedHighlight = (highlight: HighlightedText) => {
    updateActiveBook((book) => ({
      highlights: [...(book.highlights ?? []), { ...highlight, note: highlight.note ?? '' }],
      highlightsUpdatedAtIso: new Date().toISOString(),
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
      highlightsUpdatedAtIso: new Date().toISOString(),
    }));
  };

  const setActivePage = (activePageIndex: number, readingPosition?: ReadingPosition | null) => {
    if (readingPosition) {
      updateActiveBook({
        activePageIndex,
        readingPosition,
        readingPositionUpdatedAtIso: new Date().toISOString(),
      });
      return;
    }

    updateActiveBook({ activePageIndex });
  };

  /**
   * Internal mutator used by `useBooksSync` to merge a remotely-fetched book
   * into local state. Does NOT bump any *UpdatedAtIso fields and does NOT
   * change the active book id. Persists to IndexedDB.
   */
  const applyRemoteBookMerge = (bookId: string, merged: Book) => {
    setUsersBooks((prevBooks) => {
      const exists = prevBooks.some((book) => book.id === bookId);
      const nextBooks = exists
        ? prevBooks.map((book) => (book.id === bookId ? merged : book))
        : [...prevBooks, merged];
      void persistUserBook(merged);
      return nextBooks;
    });
  };

  /**
   * Internal mutator used by `useBooksSync` to remove a book that was deleted
   * remotely. Does not touch the active book id (the consumer can decide).
   */
  const removeBookLocally = (bookId: string) => {
    setUsersBooks((prev) => {
      const nextBooks = prev.filter((book) => book.id !== bookId);
      void removePersistedBook(bookId);
      return nextBooks;
    });
  };

  const shareBook = (bookId: string, userId: string, email: string) => {
    patchBook(bookId, (book) => ({
      userIds: [...new Set([...(book.userIds ?? []), userId])],
      memberEmails: { ...(book.memberEmails ?? {}), [userId]: email },
    }));
  };

  const removeUserFromBook = (bookId: string, userId: string) => {
    patchBook(bookId, (book) => {
      const emails = { ...(book.memberEmails ?? {}) };
      delete emails[userId];
      return {
        userIds: (book.userIds ?? []).filter((id) => id !== userId),
        memberEmails: emails,
      };
    });
  };

  // Record an email for a known member without changing the membership list.
  // Used to lazily persist the owner's own email into memberEmails so that
  // other members can display it later.
  const storeMemberEmail = (bookId: string, userId: string, email: string) => {
    patchBook(bookId, (book) => ({
      memberEmails: { ...(book.memberEmails ?? {}), [userId]: email },
    }));
  };

  return {
    active,
    activePage: active?.activePageIndex ?? 1,
    isUsersBooksLoaded,
    setActive: setActiveBookId,
    setActivePage,
    addBook,
    reimportBook,
    deleteBook,
    applySelectedHighlight,
    removeHighlight,
    usersBooks,
    applyRemoteBookMerge,
    removeBookLocally,
    shareBook,
    removeUserFromBook,
    storeMemberEmail,
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
