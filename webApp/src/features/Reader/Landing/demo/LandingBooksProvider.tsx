'use client';

import { ReactNode, useMemo, useState } from 'react';
import { BooksContext } from '../../hooks/useBooks';
import { Book, HighlightedText, ReadingPosition } from '../../model/types';

const resolveBookUpdate = (
  book: Book,
  updates: Partial<Book> | ((currentBook: Book) => Partial<Book>),
): Book => ({
  ...book,
  ...(typeof updates === 'function' ? updates(book) : updates),
});

export const LandingBooksProvider = ({
  book,
  onBookChange,
  children,
}: {
  book: Book;
  onBookChange: (nextBook: Book) => void;
  children: ReactNode;
}) => {
  const [activePage, setActivePageState] = useState(book.activePageIndex ?? 1);

  const value = useMemo(() => {
    const active: Book = { ...book, activePageIndex: activePage };

    const updateActiveBook = (
      updates: Partial<Book> | ((currentBook: Book) => Partial<Book>),
    ) => {
      onBookChange(resolveBookUpdate(active, updates));
    };

    return {
      active,
      activePage,
      isUsersBooksLoaded: true,
      setActive: async () => {},
      setActivePage: (activePageIndex: number, readingPosition?: ReadingPosition | null) => {
        setActivePageState(activePageIndex);
        if (readingPosition) {
          updateActiveBook({
            activePageIndex,
            readingPosition,
            readingPositionUpdatedAtIso: new Date().toISOString(),
          });
          return;
        }
        updateActiveBook({ activePageIndex });
      },
      addBook: async () => {},
      reimportBook: () => {},
      deleteBook: () => {},
      applySelectedHighlight: (highlight: HighlightedText) => {
        updateActiveBook((current) => ({
          highlights: [...(current.highlights ?? []), { ...highlight, note: highlight.note ?? '' }],
          highlightsUpdatedAtIso: new Date().toISOString(),
        }));
      },
      removeHighlight: (highlight: HighlightedText) => {
        updateActiveBook((current) => ({
          highlights: (current.highlights ?? []).filter(
            (item) =>
              !(
                item.paragraphIndex === highlight.paragraphIndex &&
                item.startIndex === highlight.startIndex &&
                item.endIndex === highlight.endIndex &&
                item.color === highlight.color
              ),
          ),
          highlightsUpdatedAtIso: new Date().toISOString(),
        }));
      },
      usersBooks: [active],
      applyRemoteBookMerge: () => {},
      removeBookLocally: () => {},
      shareBook: () => {},
      removeUserFromBook: () => {},
      storeMemberEmail: () => {},
      reassignOwner: () => {},
    };
  }, [activePage, book, onBookChange]);

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};
