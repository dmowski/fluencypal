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

  await page.goto('/book');

  const gatsbyCardTitle = page.getByRole('heading', { name: BOOK_TITLE, level: 4 });
  await expect(gatsbyCardTitle).toBeVisible();
  await gatsbyCardTitle.click();

  await expect(page.getByText(BOOK_SUBTITLE, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();
};

export const ensureReaderTextVisible = async (
  page: Page,
  targetText: string,
  options?: { maxSteps?: number },
) => {
  const maxSteps = options?.maxSteps ?? 12;

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
