import { test, expect } from '@playwright/test';
import path from 'path';

const videoFixture = path.resolve(__dirname, 'fixtures', 'sample.mp4');

test('upload test page converts and uploads video', async ({ page }) => {
  test.setTimeout(240000);
  page.setDefaultTimeout(240000);

  page.on('console', (msg) => {
    console.log(`[browser:${msg.type()}] ${msg.text()}`);
  });

  page.on('dialog', async (dialog) => {
    console.log(`[browser:dialog] ${dialog.message()}`);
    await dialog.accept();
  });

  await page.goto('/uploadTest');

  const videoInput = page.locator('input[type="file"][accept*="video"]');
  await expect(videoInput).toHaveCount(1);

  await videoInput.setInputFiles(videoFixture);

  const videoPreview = page.locator('video');
  await expect(videoPreview).toBeVisible({ timeout: 240000 });
  await expect(videoPreview).toHaveAttribute('src', /data:video/i, { timeout: 240000 });
});
