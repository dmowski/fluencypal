import { Book } from './types';

const DB_NAME = 'readerBooksDb';
const DB_VERSION = 1;
const STORE_NAME = 'readerMeta';
const USERS_BOOKS_KEY = 'usersBooks';

const isIndexedDbAvailable = () => {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
};

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
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const result = await promisifyRequest(
      store.get(USERS_BOOKS_KEY) as IDBRequest<Book[] | undefined>,
    );
    return Array.isArray(result) ? result : [];
  } finally {
    db.close();
  }
};

export const saveUsersBooksToIndexedDb = async (books: Book[]): Promise<void> => {
  const db = await openBooksDb();
  if (!db) return;

  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(books, USERS_BOOKS_KEY);
    await waitForTransaction(transaction);
  } finally {
    db.close();
  }
};
