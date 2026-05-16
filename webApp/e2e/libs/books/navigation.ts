import { expect, Page } from '@playwright/test';
import { BOOK_SUBTITLE, BOOK_TITLE } from './shared';

export const openSeededGatsbyBook = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('readerBooksDb');
    }
  });

  const gatsbyCardTitle = page.getByRole('heading', { name: BOOK_TITLE, level: 4 });

  // The /book library page can be slow on first compile under parallel
  // workers. Navigate, then wait for the seeded Gatsby card to render — and
  // reload once if it does not appear quickly enough, since the page itself
  // may have raced a stale dev-server response.
  await page.goto('/book', { waitUntil: 'domcontentloaded' });
  try {
    await expect(gatsbyCardTitle).toBeVisible({ timeout: 20_000 });
  } catch {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(gatsbyCardTitle).toBeVisible({ timeout: 20_000 });
  }
  await gatsbyCardTitle.click();

  await expect(page.getByText(BOOK_SUBTITLE, { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Read' }).click();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible({ timeout: 15_000 });
};

export const ensureReaderTextVisible = async (
  page: Page,
  targetText: string,
  options?: { maxSteps?: number },
) => {
  const maxSteps = options?.maxSteps ?? 12;

  const readButton = page.getByRole('button', { name: 'Read' });
  if (await readButton.isVisible()) {
    await readButton.click();
    await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();
  }

  for (let step = 0; step <= maxSteps; step += 1) {
    const isVisible = await page.evaluate((text) => {
      const bodyText = document.body.textContent ?? '';
      return bodyText.toLowerCase().includes(text.toLowerCase());
    }, targetText);

    if (isVisible) {
      return;
    }

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
  }

  throw new Error(`Could not find reader text after ${maxSteps} page steps: ${targetText}`);
};
