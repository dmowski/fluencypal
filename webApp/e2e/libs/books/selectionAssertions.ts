import { expect, Page } from '@playwright/test';

export const assertCurrentSelectionText = async (page: Page, expectedRegex: RegExp) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        return window.getSelection()?.toString().trim() ?? '';
      }),
    )
    .toMatch(expectedRegex);
};

export const assertSelectionTextPersists = async (
  page: Page,
  expectedRegex: RegExp,
  options?: { checks?: number; intervalMs?: number },
) => {
  const checks = options?.checks ?? 6;
  const intervalMs = options?.intervalMs ?? 120;

  for (let i = 0; i < checks; i += 1) {
    await assertCurrentSelectionText(page, expectedRegex);
    if (i < checks - 1) {
      await page.waitForTimeout(intervalMs);
    }
  }
};

export const assertCriticizingWordCursorIsPointer = async (page: Page) => {
  const hasPointerCursor = await page.evaluate(() => {
    const isVisible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
    );
    const criticizingWord = candidates.find((element) => {
      const text = (element.textContent ?? '').trim();
      return /\bcriticizing\b/i.test(text) && isVisible(element);
    });

    if (!criticizingWord) {
      return false;
    }

    const charSpans = Array.from(
      criticizingWord.querySelectorAll<HTMLElement>('[data-char-offset]'),
    );

    if (charSpans.length > 0) {
      return charSpans.every((element) => {
        return (
          element.style.cursor === 'pointer' ||
          window.getComputedStyle(element).cursor === 'pointer'
        );
      });
    }

    return (
      criticizingWord.style.cursor === 'pointer' ||
      window.getComputedStyle(criticizingWord).cursor === 'pointer'
    );
  });

  expect(hasPointerCursor).toBeTruthy();
};
