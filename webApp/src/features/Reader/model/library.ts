export interface ReaderLibraryBook {
  ebookId: string;
  title: string;
  author: string;
  downloads: number;
  coverUrl: string | null;
  bookUrl: string;
}

export interface ReaderLibraryCategory {
  id: string;
  title: string;
  books: ReaderLibraryBook[];
}
