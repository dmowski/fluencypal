import { expect, test } from '@playwright/test';

test('text constructor page works and has no console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.goto('/textConstructorTest');

  await expect(page.getByText('Progress')).toBeVisible();
  await expect(page.getByText('Translation')).toBeVisible();

  const progressText = page.locator('.progress');
  await expect(page.getByText('...')).toBeVisible();

  await expect(page.getByText('Лукас ходит в школу каждый день недели.')).toBeVisible();

  const lucasButton = page.getByRole('button', { name: 'Lucas', exact: true });
  await expect(lucasButton).toBeVisible();

  const wrongButton = page.getByRole('button').filter({ hasNotText: 'Lucas' }).first();

  await wrongButton.click();
  await expect(progressText).toHaveText('...');
  await expect(wrongButton).toHaveClass(/MuiButton-colorError/);
  await expect(wrongButton).not.toHaveClass(/MuiButton-colorError/, { timeout: 2000 });

  await lucasButton.click();
  await expect(progressText).toHaveText('Lucas');

  const goesButton = page.getByRole('button', { name: 'goes', exact: true });
  await goesButton.click();
  await expect(progressText).toHaveText('Lucas goes');

  const toButton = page.getByRole('button', { name: 'to', exact: true });
  await toButton.click();
  await expect(progressText).toHaveText('Lucas goes to');

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
