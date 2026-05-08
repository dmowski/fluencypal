import { expect, test, Page } from '@playwright/test';
import { openBooksPageWithCleanStorage } from '../books.helpers';

const GUTENBERG_ROMANCE_BOOK_ID = '1342';
const GUTENBERG_ROMANCE_TITLE = 'Pride and Prejudice';

const CHIMNEYS_EBOOK_ID = '65238';
const CHIMNEYS_TITLE = 'The Secret of Chimneys';

const parseCurrentPageFromIndicator = (value: string): number => {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 1;
  }

  return Number(match[1]);
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

test('shows live Gutenberg library categories on books home page', async ({ page }) => {
  test.setTimeout(120_000);

  await openBooksPageWithCleanStorage(page);

  await expect(page.getByRole('heading', { name: 'Library', level: 4 })).toBeVisible();

  const romanceCategory = page.getByTestId('reader-library-category-romance');
  await expect(romanceCategory).toBeVisible({ timeout: 60_000 });

  await expect
    .poll(async () => romanceCategory.locator('[data-testid^="reader-library-book-"]').count())
    .toBeGreaterThan(0);

  const romanceBook = page.getByTestId(`reader-library-book-${GUTENBERG_ROMANCE_BOOK_ID}`);
  await expect(romanceBook).toContainText(GUTENBERG_ROMANCE_TITLE);
  await expect(romanceBook.locator('img')).toBeVisible();
});

test('downloads a live Gutenberg EPUB and opens it in the reader', async ({ page }) => {
  test.setTimeout(240_000);

  await openBooksPageWithCleanStorage(page);

  const gutenbergBookCard = page.getByTestId(`reader-library-book-${GUTENBERG_ROMANCE_BOOK_ID}`);
  await expect(gutenbergBookCard).toBeVisible({ timeout: 60_000 });

  await gutenbergBookCard.click();

  await expect(page.getByTestId('library-download-fixed-panel')).toBeVisible();

  await expect(page.getByRole('heading', { name: GUTENBERG_ROMANCE_TITLE, level: 2 })).toBeVisible({
    timeout: 180_000,
  });
  await page.getByRole('button', { name: 'Read' }).click();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();
  await expect(page.getByTestId('reader-page-indicator')).toBeVisible();

  const readerContent = page.getByTestId('reader-content');
  const titleLabel = readerContent.locator('strong').filter({ hasText: 'Title' }).first();

  for (let step = 0; step < 8; step += 1) {
    if (await titleLabel.count()) {
      break;
    }

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
  }

  await expect(titleLabel).toBeVisible();
  await expect(readerContent).toContainText('Pride and Prejudice');
  await expect(readerContent.getByText('**Title**', { exact: false })).toHaveCount(0);

  const storedTitles = await page.evaluate(async () => {
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

    return books
      .map((book) => (book && typeof book === 'object' ? (book as { title?: string }).title : ''))
      .filter((title): title is string => Boolean(title));
  });

  expect(storedTitles).toContain(GUTENBERG_ROMANCE_TITLE);
});

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
  await page.getByRole('button', { name: 'Read' }).click();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();

  // Navigate through pages to find a rendered image (data URI from parsed EPUB)
  let hasRenderedDataImage = await findVisibleRenderedImage(page);
  for (let step = 0; step < 3 && !hasRenderedDataImage; step += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    hasRenderedDataImage = await findVisibleRenderedImage(page);
  }

  expect(hasRenderedDataImage).toBeTruthy();

  await page.getByRole('button', { name: 'Book info' }).click();
  await page.getByTestId('book-info-menu-chapters').click();

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

  await expect(page.getByTestId('book-info-modal')).not.toBeVisible();

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
