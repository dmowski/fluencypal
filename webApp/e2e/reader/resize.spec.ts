import { expect, test } from '@playwright/test';
import { openSeededGatsbyBook } from '../books.helpers';

test('resize keeps first visible word anchored and temporary highlight is removed after 1 second', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openSeededGatsbyBook(page);

  const firstVisibleAnchor = await page.evaluate(() => {
    const contentElement = document.querySelector<HTMLElement>('[data-testid="reader-content"]');
    if (!contentElement) {
      return null;
    }

    const contentRect = contentElement.getBoundingClientRect();
    const candidates = Array.from(
      contentElement.querySelectorAll<HTMLElement>('[data-reader-word-anchor="true"]'),
    );

    for (const element of candidates) {
      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.height > 0 &&
        rect.width > 0 &&
        rect.bottom > contentRect.top + 1 &&
        rect.top < contentRect.bottom - 1;

      if (!isVisible) {
        continue;
      }

      const key = element.dataset.readerAnchorKey ?? null;
      const text = (element.textContent ?? '').trim();
      if (!key || !text) {
        continue;
      }

      return { key, text };
    }

    return null;
  });

  expect(firstVisibleAnchor).not.toBeNull();
  if (!firstVisibleAnchor) {
    return;
  }

  await page.setViewportSize({ width: 1700, height: 900 });

  const highlightedAnchor = page.locator(
    `[data-resize-anchor-highlighted="true"][data-reader-anchor-key="${firstVisibleAnchor.key}"]`,
  );
  await expect(highlightedAnchor).toBeVisible({ timeout: 4000 });

  const isAnchorVisibleWithinReader = await highlightedAnchor.first().evaluate((element) => {
    const contentElement = element.closest('[data-testid="reader-content"]') as HTMLElement | null;
    if (!contentElement) {
      return false;
    }

    const elementRect = element.getBoundingClientRect();
    const contentRect = contentElement.getBoundingClientRect();

    return elementRect.bottom > contentRect.top + 1 && elementRect.top < contentRect.bottom - 1;
  });

  expect(isAnchorVisibleWithinReader).toBe(true);

  await page.waitForTimeout(1200);
  await expect(page.locator('[data-resize-anchor-highlighted="true"]')).toHaveCount(0);
});
