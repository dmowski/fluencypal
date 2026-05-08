import { expect, Page } from '@playwright/test';

export const assertSpaceBetweenLikeAndCriticizing = async (page: Page) => {
  const readerText = await page.locator('body').evaluate((el) => el.textContent ?? '');
  const stripped = readerText.replace(/[*_~`]/g, '');
  const normalized = stripped.replace(/\s+/g, ' ');
  expect(normalized).toMatch(/like criticizing/);
};

export const assertReaderContentFitsCurrentPage = async (page: Page) => {
  const fitChecker = page.getByTestId('content-fit-checker');
  await expect(fitChecker).toBeVisible();

  await expect
    .poll(async () => {
      const loading = await fitChecker.getAttribute('data-loading');
      const isFit = await fitChecker.getAttribute('data-is-content-fit');
      return { loading, isFit };
    })
    .toEqual({ loading: 'false', isFit: 'true' });

  await expect(page.getByTestId('content-fit')).toHaveText('true');
};
