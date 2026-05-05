import { expect, test, Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createFileDropDataTransfer,
  dropDataTransferOnBooksList,
  ensureReaderTextVisible,
  importBookFromPicker,
  openAddBookFileChooser,
  openBooksPageWithCleanStorage,
} from './books.helpers';
import { assertReaderContentFitsCurrentPage } from './libs/books/assertions';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';
const EXPECTED_COPYRIGHT = 'Copyright © 2024 by Charles Duhigg';
const EXPECTED_COVER_IMAGE_KEY = 'images/9780385697750_cover.jpg';
const EXPECTED_ITALIC_SENTENCE_FRAGMENT = 'memorizes rugby world champions from the 1960s?';
const EXPECTED_ITALIC_WORD = 'Who,';

const parseCurrentPageFromIndicator = (value: string): number => {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 1;
  }

  return Number(match[1]);
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

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible();

  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, { maxSteps: 30 });
  await expect
    .poll(async () => (await page.locator('body').innerText()).includes(EXPECTED_COPYRIGHT))
    .toBeTruthy();

  let hasRenderedDataImage = await findVisibleRenderedImage(page);
  for (let step = 0; step < 8 && !hasRenderedDataImage; step += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
    hasRenderedDataImage = await findVisibleRenderedImage(page);
  }
  expect(hasRenderedDataImage).toBeTruthy();

  for (let step = 0; step < 8; step += 1) {
    await assertVisibleReaderColumnsFitViewport(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
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

  const fixturePath = path.resolve(process.cwd(), BOOK_FIXTURE_PATH);
  const epubBytes = Array.from(await readFile(fixturePath));

  const dataTransfer = await createFileDropDataTransfer({
    page,
    name: 'Supercommunicators.epub',
    type: 'application/epub+zip',
    contents: epubBytes,
  });

  await dropDataTransferOnBooksList(page, dataTransfer);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({
    timeout: 60_000,
  });
  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, {
    maxSteps: 12,
  });
});

test('renders punctuation-adjacent markdown emphasis as italic text', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible();

  await ensureReaderTextVisible(page, EXPECTED_ITALIC_SENTENCE_FRAGMENT, {
    maxSteps: 40,
  });

  const readerContent = page.getByTestId('reader-content');
  const italicWho = readerContent.locator('em').filter({ hasText: EXPECTED_ITALIC_WORD }).first();
  const italicSentenceFragment = readerContent
    .locator('em')
    .filter({ hasText: EXPECTED_ITALIC_SENTENCE_FRAGMENT })
    .first();

  await expect(italicWho).toBeVisible();
  await expect(italicSentenceFragment).toBeVisible();
  await expect(readerContent.getByText('_Who,_', { exact: false })).toHaveCount(0);
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

test('first page content fits viewport at 1400x700 (cover image)', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 700 });

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible();

  await page.getByRole('heading', { name: 'Supercommunicators', level: 2 }).click();
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();

  await assertReaderContentFitsCurrentPage(page);
});

test('opens chapters popover and jumps to selected chapter page', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await page.getByRole('heading', { name: 'Supercommunicators', level: 2 }).click();
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();

  const chaptersTrigger = page.getByTestId('reader-chapters-trigger');
  await expect(chaptersTrigger).toBeVisible();
  await chaptersTrigger.click();

  const chaptersPopover = page.getByTestId('reader-chapters-popover');
  await expect(chaptersPopover).toBeVisible();

  const chapterItems = page.getByTestId('reader-chapter-item');
  await expect.poll(async () => chapterItems.count()).toBeGreaterThan(0);

  const pageIndicator = page.getByTestId('reader-page-indicator');

  const candidateIndex = await chapterItems.evaluateAll((elements) => {
    return elements.findIndex((element) => {
      const targetValue = element.getAttribute('data-target-page') || '';
      const targetPage = Number(targetValue);
      return Number.isFinite(targetPage) && targetPage > 0;
    });
  });

  const chapterItemToClick =
    candidateIndex >= 0 ? chapterItems.nth(candidateIndex) : chapterItems.first();
  const clickedTargetPage = Number(
    (await chapterItemToClick.getAttribute('data-target-page')) || '0',
  );
  const normalizedClickedTargetPage =
    clickedTargetPage > 1 && clickedTargetPage % 2 === 0
      ? clickedTargetPage - 1
      : clickedTargetPage;

  await chapterItemToClick.click();

  await expect(chaptersPopover).not.toBeVisible();

  const finalIndicatorValue = await pageIndicator.innerText();
  const finalPage = parseCurrentPageFromIndicator(finalIndicatorValue);

  if (normalizedClickedTargetPage > 0) {
    expect(finalPage).toBe(normalizedClickedTargetPage);
  } else {
    expect(finalPage).toBeGreaterThan(0);
  }
});

const CHIMNEYS_EBOOK_ID = '65238';
const CHIMNEYS_TITLE = 'The Secret of Chimneys';

test('downloads library EPUB with images and renders image in reader', async ({ page }) => {
  test.setTimeout(300_000);

  await openBooksPageWithCleanStorage(page);

  const romanceCategory = page.getByTestId('reader-library-category-romance');
  await expect(romanceCategory).toBeVisible({ timeout: 60_000 });

  const bookCard = page.getByTestId(`reader-library-book-${CHIMNEYS_EBOOK_ID}`);
  await expect(bookCard).toBeVisible({ timeout: 60_000 });
  await bookCard.click();

  await expect(page.getByTestId('library-download-fixed-panel')).toBeVisible();

  await expect(page.getByRole('heading', { name: CHIMNEYS_TITLE, level: 2 })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();

  // Navigate through pages to find a rendered image (data URI from parsed EPUB)
  let hasRenderedDataImage = await findVisibleRenderedImage(page);
  for (let step = 0; step < 3 && !hasRenderedDataImage; step += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    hasRenderedDataImage = await findVisibleRenderedImage(page);
  }

  expect(hasRenderedDataImage).toBeTruthy();

  const chaptersTrigger = page.getByTestId('reader-chapters-trigger');
  await chaptersTrigger.click();

  const chaptersPopover = page.getByTestId('reader-chapters-popover');
  await expect(chaptersPopover).toBeVisible();

  const contentsChapterItem = chaptersPopover
    .getByTestId('reader-chapter-item')
    .filter({ hasText: /contents/i })
    .first();

  if ((await contentsChapterItem.count()) > 0) {
    await contentsChapterItem.click();
  } else {
    await chaptersPopover.getByTestId('reader-chapter-item').first().click();
  }

  await expect(chaptersPopover).not.toBeVisible();

  let chapterLinkFound = false;
  for (let step = 0; step < 6 && !chapterLinkFound; step += 1) {
    chapterLinkFound =
      (await page.locator('[data-testid="reader-content"] a[data-reader-target-page]').count()) > 0;
    if (!chapterLinkFound) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(150);
    }
  }

  expect(chapterLinkFound).toBeTruthy();

  await expect(page.getByText(/\[[^\]]+\]\([^)]*\)/)).toHaveCount(0);

  const pageIndicator = page.getByTestId('reader-page-indicator');
  const pageBeforeLinkClick = parseCurrentPageFromIndicator(await pageIndicator.innerText());

  const chapterLinksWithTarget = page.locator(
    '[data-testid="reader-content"] a[data-reader-target-page]',
  );
  const chapterLinkIndex = await chapterLinksWithTarget.evaluateAll((elements, currentPage) => {
    return elements.findIndex((element) => {
      const targetPage = Number(element.getAttribute('data-reader-target-page') || '0');
      if (!Number.isFinite(targetPage) || targetPage <= 0) {
        return false;
      }

      const normalizedTargetPage =
        targetPage > 1 && targetPage % 2 === 0 ? targetPage - 1 : targetPage;

      return normalizedTargetPage !== currentPage;
    });
  }, pageBeforeLinkClick);

  expect(chapterLinkIndex).toBeGreaterThanOrEqual(0);

  const chapterLink = chapterLinksWithTarget.nth(chapterLinkIndex);
  const chapterLinkTarget = Number(
    (await chapterLink.getAttribute('data-reader-target-page')) || '0',
  );
  expect(chapterLinkTarget).toBeGreaterThan(0);

  await chapterLink.evaluate((element) => {
    (element as HTMLElement).click();
  });
});
