import { Page, expect } from '@playwright/test';

const FIRESTORE_EMULATOR_HOST = 'http://127.0.0.1:8080';
const STORAGE_EMULATOR_HOST = 'http://127.0.0.1:9199';
const FIREBASE_PROJECT_ID = 'dark-lang';
const FIREBASE_BUCKET = 'dark-lang.firebasestorage.app';
// The Firebase emulators accept this bearer token to bypass security rules,
// which is necessary when verifying writes from outside the browser context.
const EMULATOR_OWNER_HEADERS = { Authorization: 'Bearer owner' } as const;

export interface RemoteReaderBookDoc {
  id: string;
  title: string;
  paragraphsBlobPath?: string | null;
  highlights?: unknown;
  highlightsUpdatedAtIso?: string | null;
  readingPosition?: unknown;
  dataUpdatedAtIso?: string | null;
}

const decodeFirestoreValue = (value: any): any => {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) {
    const fields = value.mapValue?.fields ?? {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v as any);
    }
    return out;
  }
  if ('arrayValue' in value) {
    const values = value.arrayValue?.values ?? [];
    return values.map((v: any) => decodeFirestoreValue(v));
  }
  return null;
};

/**
 * List remote reader books for a user via the Firestore REST API. Uses a
 * runQuery with an ARRAY_CONTAINS filter on `memberIds` to match the new
 * root-level /books collection (where the client queries with
 * `where('memberIds', 'array-contains', uid)`).
 */
export const listRemoteReaderBooks = async (uid: string): Promise<RemoteReaderBookDoc[]> => {
  const url = `${FIRESTORE_EMULATOR_HOST}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'books' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'memberIds' },
          op: 'ARRAY_CONTAINS',
          value: { stringValue: uid },
        },
      },
    },
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...EMULATOR_OWNER_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`listRemoteReaderBooks failed: ${response.status} ${await response.text()}`);
  }
  const json = (await response.json()) as Array<{ document?: any }>;
  return json
    .filter((entry) => entry.document != null)
    .map((entry) => {
      const decoded = decodeFirestoreValue({
        mapValue: { fields: entry.document.fields ?? {} },
      }) as Record<string, unknown>;
      return decoded as unknown as RemoteReaderBookDoc;
    });
};

export const waitForRemoteReaderBooksCount = async (
  uid: string,
  expectedCount: number,
  options?: { timeoutMs?: number },
): Promise<RemoteReaderBookDoc[]> => {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const deadline = Date.now() + timeoutMs;
  let last: RemoteReaderBookDoc[] = [];
  while (Date.now() < deadline) {
    last = await listRemoteReaderBooks(uid);
    if (last.length === expectedCount) return last;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Expected ${expectedCount} remote reader books for ${uid}, got ${last.length} after ${timeoutMs}ms`,
  );
};

export const waitForRemoteBookField = async <K extends keyof RemoteReaderBookDoc>(
  uid: string,
  bookId: string,
  field: K,
  predicate: (value: RemoteReaderBookDoc[K]) => boolean,
  options?: { timeoutMs?: number },
): Promise<RemoteReaderBookDoc> => {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const deadline = Date.now() + timeoutMs;
  let last: RemoteReaderBookDoc | undefined;
  while (Date.now() < deadline) {
    const all = await listRemoteReaderBooks(uid);
    last = all.find((b) => b.id === bookId);
    if (last && predicate(last[field])) return last;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Field ${String(field)} on book ${bookId} did not satisfy predicate within ${timeoutMs}ms (last value: ${JSON.stringify(
      last?.[field],
    )})`,
  );
};

export const headParagraphsBlob = async (path: string): Promise<boolean> => {
  // Firebase Storage emulator REST endpoint shape:
  //   GET /v0/b/{bucket}/o/{encodedPath}?alt=media   → file body
  //   GET /v0/b/{bucket}/o/{encodedPath}             → metadata
  const url = `${STORAGE_EMULATOR_HOST}/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(path)}`;
  const response = await fetch(url, { headers: EMULATOR_OWNER_HEADERS });
  return response.ok;
};

export const waitForParagraphsBlob = async (path: string, options?: { timeoutMs?: number }) => {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await headParagraphsBlob(path)) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Paragraphs blob not found at ${path} after ${timeoutMs}ms`);
};

/** Read the local IndexedDB book id for the (single) imported book. */
export const getFirstLocalBookId = async (page: Page): Promise<string> => {
  return await page.evaluate<string>(async () => {
    const dbName = 'readerBooksDb';
    return await new Promise<string>((resolve, reject) => {
      const req = indexedDB.open(dbName);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const stores = Array.from(db.objectStoreNames);
        const storeName = stores.find((n) => n.toLowerCase().includes('book')) ?? stores[0];
        if (!storeName) {
          reject(new Error('No object store in readerBooksDb'));
          return;
        }
        const tx = db.transaction(storeName, 'readonly');
        const getAll = tx.objectStore(storeName).getAll();
        getAll.onsuccess = () => {
          const records = (getAll.result as Array<{ id?: string }>) || [];
          if (!records[0]?.id) {
            reject(new Error('No book records in IndexedDB'));
            return;
          }
          resolve(records[0].id);
        };
        getAll.onerror = () => reject(getAll.error);
      };
    });
  });
};

export const expectNoRemoteBooks = async (uid: string) => {
  const docs = await listRemoteReaderBooks(uid);
  expect(docs).toHaveLength(0);
};
