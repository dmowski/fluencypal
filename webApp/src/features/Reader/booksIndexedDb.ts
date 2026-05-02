import { Book } from './types';

const DB_NAME = 'readerBooksDb';
const DB_VERSION = 1;
const STORE_NAME = 'readerMeta';
const USERS_BOOKS_LEGACY_KEY = 'usersBooks';

const isIndexedDbAvailable = () => {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
};

const createBookId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `book-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const isBookRecord = (value: unknown): value is Book => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const maybeBook = value as Partial<Book>;

  return (
    typeof maybeBook.id === 'string' &&
    typeof maybeBook.title === 'string' &&
    typeof maybeBook.subtitle === 'string' &&
    typeof maybeBook.category === 'string' &&
    Array.isArray(maybeBook.paragraphs)
  );
};

const normalizeStoredBook = (book: Omit<Book, 'id'> & Partial<Pick<Book, 'id'>>): Book => ({
  ...book,
  id: book.id || createBookId(),
});

const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const waitForTransaction = (transaction: IDBTransaction): Promise<void> => {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

const openBooksDb = async (): Promise<IDBDatabase | null> => {
  if (!isIndexedDbAvailable()) return null;

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  };

  return promisifyRequest(request);
};

export const loadUsersBooksFromIndexedDb = async (): Promise<Book[]> => {
  const db = await openBooksDb();
  if (!db) return [];

  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const legacyBooks = await promisifyRequest(
      store.get(USERS_BOOKS_LEGACY_KEY) as IDBRequest<Array<Omit<Book, 'id'> & Partial<Pick<Book, 'id'>>> | undefined>,
    );

    if (Array.isArray(legacyBooks)) {
      const migratedBooks = legacyBooks.map(normalizeStoredBook);
      store.delete(USERS_BOOKS_LEGACY_KEY);
      migratedBooks.forEach((book) => {
        store.put(book, book.id);
      });
      await waitForTransaction(transaction);
      return migratedBooks;
    }

    const result = await promisifyRequest(store.getAll() as IDBRequest<unknown[]>);
    await waitForTransaction(transaction);
    return result.filter(isBookRecord);
  } finally {
    db.close();
  }
};

export const saveUserBookToIndexedDb = async (book: Book): Promise<void> => {
  const db = await openBooksDb();
  if (!db) return;

  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(book, book.id);
    await waitForTransaction(transaction);
  } finally {
    db.close();
  }
};

export const deleteUserBookFromIndexedDb = async (bookId: string): Promise<void> => {
  const db = await openBooksDb();
  if (!db) return;

  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(bookId);
    await waitForTransaction(transaction);
  } finally {
    db.close();
  }
};
