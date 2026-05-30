import { expect, test, Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createFileDropDataTransfer,
  dropDataTransferOnBooksList,
  ensureReaderTextVisible,
  expectImportedBookReady,
  importBookFromPicker,
  mockConvertDocToTextRoute,
  openAddBookFileChooser,
  openBooksPageWithCleanStorage,
  pressReaderNextPage,
} from '../libs/reader';
import {
  createEmulatorTestUser,
  resetEmulatorState,
  signInTestUserOnPage,
} from '../libs/books/auth';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';
const EXPECTED_COPYRIGHT = 'Copyright © 2024 by Charles Duhigg';
const EXPECTED_COVER_IMAGE_KEY = 'images/9780385697750_cover.jpg';

const STORAGE_EMULATOR_HOST = 'http://127.0.0.1:9199';
const FIREBASE_BUCKET = 'dark-lang.firebasestorage.app';
const FIRESTORE_EMULATOR_HOST = 'http://127.0.0.1:8080';
const FIREBASE_PROJECT_ID = 'dark-lang';

/**
 * Uploads an EPUB fixture to the Storage emulator under the given path, then
 * intercepts /api/reader/convert so tests don't need a real CloudConvert key.
 *
 * A minimal Firestore stub is created for `bookId` so that the Firebase
 * Storage security rules allow the app to download the converted EPUB later.
 */
const mockConvertToPipelineEpub = async (
  page: Page,
  bookId: string,
  epubFixturePath: string,
  ownerUid: string,
): Promise<string> => {
  // Create a Firestore stub so Storage rules can verify membership when the
  // app calls downloadConvertResultAsFile for books/{bookId}/converted.epub.
  const firestoreUrl = `${FIRESTORE_EMULATOR_HOST}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/books?documentId=${encodeURIComponent(bookId)}`;
  const stubRes = await fetch(firestoreUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({
      fields: {
        id: { stringValue: bookId },
        ownerUserId: { stringValue: ownerUid },
        memberIds: { arrayValue: { values: [{ stringValue: ownerUid }] } },
        userIds: { arrayValue: { values: [] } },
      },
    }),
  });
  if (!stubRes.ok) {
    throw new Error(`Firestore stub creation failed: ${stubRes.status} ${await stubRes.text()}`);
  }

  const epubBytes = await readFile(path.resolve(epubFixturePath));
  const storagePath = `books/${bookId}/converted.epub`;

  // Upload to Storage emulator (bypass rules with 'owner' token).
  const uploadUrl = `${STORAGE_EMULATOR_HOST}/upload/storage/v1/b/${FIREBASE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(storagePath)}`;
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/epub+zip',
      Authorization: 'Bearer owner',
    },
    body: epubBytes,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Storage emulator upload failed: ${uploadResponse.status} ${await uploadResponse.text()}`);
  }

  await page.route('**/api/reader/convert', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ epubBlobPath: storagePath }),
    });
  });

  return storagePath;
};

const assertVisibleReaderColumnsFitViewport = async (page: Page) => {
  const columns = page.getByTestId('reader-page-column');
  const count = await columns.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const metrics = await columns.nth(index).evaluate((element) => {
      const node = element as HTMLElement;
      return {
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 2);
  }
};

const findVisibleRenderedImage = async (page: Page): Promise<boolean> => {
  const renderedImage = page.locator('img[src^="data:image/"]').first();
  if (await renderedImage.count()) {
    if (await renderedImage.isVisible()) {
      return true;
    }
  }

  return false;
};

test('imports EPUB with images and opens reader with parsed content', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expectImportedBookReady(page, 'Supercommunicators');

  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, { maxSteps: 30 });
  await expect
    .poll(async () => (await page.locator('body').innerText()).includes(EXPECTED_COPYRIGHT))
    .toBeTruthy();

  let hasRenderedDataImage = await findVisibleRenderedImage(page);
  for (let step = 0; step < 8 && !hasRenderedDataImage; step += 1) {
    await pressReaderNextPage(page);
    hasRenderedDataImage = await findVisibleRenderedImage(page);
  }
  expect(hasRenderedDataImage).toBeTruthy();

  for (let step = 0; step < 8; step += 1) {
    await assertVisibleReaderColumnsFitViewport(page);
    await pressReaderNextPage(page);
  }

  const imageMapState = await page.evaluate(async (expectedImageKey) => {
    const openDb = (): Promise<IDBDatabase> =>
      new Promise((resolve, reject) => {
        const request = window.indexedDB.open('readerBooksDb', 1);
        request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
        request.onsuccess = () => resolve(request.result);
      });

    const db = await openDb();

    const books: unknown[] = await new Promise((resolve, reject) => {
      const transaction = db.transaction('readerMeta', 'readonly');
      const store = transaction.objectStore('readerMeta');
      const request = store.getAll();

      request.onerror = () => reject(request.error ?? new Error('Failed to read books from DB'));
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    });

    db.close();

    const savedBook = books.find((book) => {
      if (!book || typeof book !== 'object') return false;
      return (book as { title?: string }).title === 'Supercommunicators';
    }) as
      | {
          imagesByHref?: Record<string, string>;
          imageAspectRatioByHref?: Record<string, number>;
        }
      | undefined;

    const imagesByHref = savedBook?.imagesByHref ?? {};
    const imageAspectRatioByHref = savedBook?.imageAspectRatioByHref ?? {};
    const coverSrc = imagesByHref[expectedImageKey] ?? '';
    const coverAspectRatio = imageAspectRatioByHref[expectedImageKey] ?? 0;

    return {
      imageCount: Object.keys(imagesByHref).length,
      aspectRatioCount: Object.keys(imageAspectRatioByHref).length,
      hasCoverImageKey: Boolean(imagesByHref[expectedImageKey]),
      coverSrc,
      coverAspectRatio,
    };
  }, EXPECTED_COVER_IMAGE_KEY);

  expect(imageMapState.imageCount).toBeGreaterThan(0);
  expect(imageMapState.aspectRatioCount).toBeGreaterThan(0);
  expect(imageMapState.hasCoverImageKey).toBeTruthy();
  expect(imageMapState.coverSrc).toMatch(/^data:image\/[a-zA-Z0-9.+-]+;base64,/);
  expect(imageMapState.coverAspectRatio).toBeGreaterThan(0);
});

test('imports book by dropping EPUB on books page', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await mockConvertDocToTextRoute(page);

  const fixturePath = path.resolve(process.cwd(), BOOK_FIXTURE_PATH);
  const epubBytes = Array.from(await readFile(fixturePath));

  const dataTransfer = await createFileDropDataTransfer({
    page,
    name: 'Supercommunicators.epub',
    type: 'application/epub+zip',
    contents: epubBytes,
  });

  await dropDataTransferOnBooksList(page, dataTransfer);

  await expectImportedBookReady(page, 'Supercommunicators');
  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, {
    maxSteps: 12,
  });
});

test('shows validation error when unsupported file is selected in Add Book picker', async ({
  page,
}) => {
  await openBooksPageWithCleanStorage(page);

  const fileChooser = await openAddBookFileChooser(page);
  await fileChooser.setFiles({
    name: 'invalid.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from('video mock payload', 'utf8'),
  });

  await expect(page.getByTestId('books-drop-import-error')).toHaveText(
    'Please select a valid EPUB file.',
  );
});

test('shows auth modal when PDF is selected without being signed in', async ({ page }) => {
  await openBooksPageWithCleanStorage(page);

  const fileChooser = await openAddBookFileChooser(page);
  await fileChooser.setFiles({
    name: 'sample.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 mock', 'utf8'),
  });

  // The sign-in modal for PDF conversion should appear
  await expect(page.getByTestId('convert-auth-modal')).toBeVisible();
});

test('imports PDF via conversion pipeline', async ({ page }) => {
  test.setTimeout(120_000);
  await resetEmulatorState();
  const user = await createEmulatorTestUser();

  await openBooksPageWithCleanStorage(page);
  await signInTestUserOnPage(page, user);

  // Mock browser-side Storage uploads so uploadConvertTempFile (PDF) and the
  // subsequent paragraphs blob upload complete instantly without hitting the
  // Storage emulator slowness.  GET downloads still pass through so the
  // pre-seeded EPUB can be fetched by downloadConvertResultAsFile.
  await page.route(/http:\/\/(127\.0\.0\.1|localhost):9199\//, (route) => {
    const method = route.request().method();
    if (method !== 'POST' && method !== 'PUT') {
      void route.continue();
      return;
    }
    let name = 'unknown';
    try {
      const params = new URL(route.request().url()).searchParams;
      name = decodeURIComponent(params.get('name') ?? 'unknown');
    } catch {
      // ignore
    }
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name,
        bucket: FIREBASE_BUCKET,
        generation: '1',
        metageneration: '1',
        contentType: 'application/octet-stream',
        size: '1',
      }),
    });
  });

  // Pre-upload a known EPUB to the Storage emulator and intercept the convert
  // route so the test doesn't need a real CloudConvert API key.
  // A Firestore stub for mockBookId is created inside mockConvertToPipelineEpub
  // so that the Storage rules allow the app to download the converted EPUB.
  const mockBookId = `e2e-pdf-mock-${Date.now()}`;
  await mockConvertToPipelineEpub(page, mockBookId, BOOK_FIXTURE_PATH, user.uid);
  await mockConvertDocToTextRoute(page);

  const pdfFixturePath = path.resolve('public/Reader/sample.pdf');
  const fileChooser = await openAddBookFileChooser(page);
  await fileChooser.setFiles(pdfFixturePath);

  // All network-heavy steps are now mocked/instant. Wait for the reader to
  // open and show an h2 heading (the book title rendered by ReaderHeader).
  await expect
    .poll(async () => page.getByRole('heading', { level: 2 }).first().isVisible(), {
      timeout: 60_000,
    })
    .toBe(true);
});
