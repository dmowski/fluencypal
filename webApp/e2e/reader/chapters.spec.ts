import { expect, test } from '@playwright/test';
import { importBookFromPicker, openBooksPageWithCleanStorage } from '../libs/reader';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';

const parseCurrentPageFromIndicator = (value: string): number => {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 1;
  }

  return Number(match[1]);
};

test('chapter list maps each chapter to a unique target page', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({ timeout: 60_000 });

  await page.getByRole('button', { name: 'Read' }).click();
  await page.getByRole('button', { name: 'Book info' }).click();
  await page.getByTestId('book-info-menu-chapters').click();

  const chapterPopover = page.getByTestId('reader-chapters-popover');
  await expect(chapterPopover).toBeVisible();

  const chapterTargetPages = await chapterPopover
    .getByTestId('reader-chapter-item')
    .evaluateAll((elements) => {
      return elements
        .map((element) => Number(element.getAttribute('data-target-page') || '0'))
        .filter((value) => Number.isFinite(value) && value > 0);
    });

  expect(chapterTargetPages.length).toBeGreaterThan(1);
  expect(new Set(chapterTargetPages).size).toBe(chapterTargetPages.length);
});

test('opens chapters popover and jumps to selected chapter page', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await page.getByRole('heading', { name: 'Supercommunicators', level: 2 }).click();
  await page.getByRole('button', { name: 'Read' }).click();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();
  await page.getByRole('button', { name: 'Book info' }).click();
  await page.getByTestId('book-info-menu-chapters').click();

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

  await expect(page.getByTestId('book-info-modal')).not.toBeVisible();

  const finalIndicatorValue = await pageIndicator.innerText();
  const finalPage = parseCurrentPageFromIndicator(finalIndicatorValue);

  if (normalizedClickedTargetPage > 0) {
    expect(finalPage).toBe(normalizedClickedTargetPage);
  } else {
    expect(finalPage).toBeGreaterThan(0);
  }
});
