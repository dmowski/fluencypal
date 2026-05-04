import { expect, Page } from '@playwright/test';
import { getCriticizingWordLocator } from './locators';

export const assertWordHoverHasEffect = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);
  await criticizingWord.hover();

  const hoverAfterBackgroundColor = await criticizingWord.evaluate((node) => {
    const directPseudo = window.getComputedStyle(node, '::after').backgroundColor;
    if (directPseudo !== 'rgba(0, 0, 0, 0)') {
      return directPseudo;
    }

    const wordContainer = node.closest(
      '[data-word-index], .conversation-word',
    ) as HTMLElement | null;

    if (!wordContainer) {
      return directPseudo;
    }

    return window.getComputedStyle(wordContainer, '::after').backgroundColor;
  });

  expect(hoverAfterBackgroundColor).not.toBe('rgba(0, 0, 0, 0)');
};

export const assertHighlightPopoverVisible = async (page: Page) => {
  await expect(page.getByRole('button', { name: 'Y', exact: true })).toBeVisible();
};

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
  const criticizingWord = await getCriticizingWordLocator(page);

  const cursors = await criticizingWord.evaluate((node) => {
    const element = node as HTMLElement;
    const descendants = Array.from(element.querySelectorAll<HTMLElement>('*'));
    const nodes = [element, ...descendants];

    return nodes.map((entry) => window.getComputedStyle(entry).cursor);
  });

  expect(cursors.length).toBeGreaterThan(0);
  expect(cursors.every((cursor) => cursor === 'pointer')).toBeTruthy();
};

export const assertTranslatedTextVisible = async (page: Page, text: string) => {
  await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
};

export const assertSpaceBetweenLikeAndCriticizing = async (page: Page) => {
  const readerText = await page.locator('body').evaluate((el) => el.textContent ?? '');
  const stripped = readerText.replace(/[*_~`]/g, '');
  const normalized = stripped.replace(/\s+/g, ' ');
  expect(normalized).toMatch(/like criticizing/);
};

export const assertWordHighlightedYellow = async (page: Page, wordText: RegExp | string) => {
  const pattern = typeof wordText === 'string' ? new RegExp(wordText, 'i') : wordText;

  await expect
    .poll(async () =>
      page.evaluate(
        ({ patternSource, patternFlags }) => {
          const regex = new RegExp(patternSource, patternFlags);
          const candidates = Array.from(
            document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
          );
          const host = candidates.find((entry) => regex.test(entry.textContent ?? ''));
          if (!host) return false;

          const charSpans = Array.from(host.querySelectorAll<HTMLElement>('[data-char-offset]'));
          if (!charSpans.length) return false;

          const rendered = charSpans.map((entry) => entry.textContent ?? '').join('');
          const match = rendered.match(regex);
          if (!match || match.index === undefined) return false;

          const targetChars = charSpans.slice(match.index, match.index + match[0].length);
          if (!targetChars.length) return false;

          return targetChars.every((entry) => {
            const color = window.getComputedStyle(entry).backgroundColor;
            return color.includes('255, 224, 102');
          });
        },
        { patternSource: pattern.source, patternFlags: pattern.flags },
      ),
    )
    .toBeTruthy();
};

export const assertWheneverHighlightedYellow = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
        );

        const wheneverHost = candidates.find((entry) =>
          (entry.textContent ?? '').toLowerCase().includes('whenever'),
        );
        if (!wheneverHost) return false;

        const charSpans = Array.from(
          wheneverHost.querySelectorAll<HTMLElement>('[data-char-offset]'),
        );
        if (!charSpans.length) return false;

        const rendered = charSpans.map((entry) => entry.textContent ?? '').join('');
        const start = rendered.toLowerCase().indexOf('whenever');
        if (start < 0) return false;

        const targetChars = charSpans.slice(start, start + 'whenever'.length);
        if (targetChars.length !== 'whenever'.length) return false;

        return targetChars.every((entry) => {
          const color = window.getComputedStyle(entry).backgroundColor;
          return color.includes('255, 224, 102');
        });
      }),
    )
    .toBeTruthy();
};

export const assertOnlyWheneverHighlightedYellow = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
        );
        const wheneverHost = candidates.find((entry) =>
          (entry.textContent ?? '').toLowerCase().includes('whenever'),
        );
        if (!wheneverHost) return false;

        const paragraphRoot = wheneverHost.closest('.MuiTypography-root') as HTMLElement | null;
        if (!paragraphRoot) return false;

        const wheneverChars = Array.from(
          wheneverHost.querySelectorAll<HTMLElement>('[data-char-offset]'),
        );
        const rendered = wheneverChars.map((entry) => entry.textContent ?? '').join('');
        const start = rendered.toLowerCase().indexOf('whenever');
        if (start < 0) return false;

        const expectedOffsets = wheneverChars
          .slice(start, start + 'whenever'.length)
          .map((entry) => Number(entry.getAttribute('data-char-offset') ?? '-1'));

        const yellowOffsets = Array.from(
          paragraphRoot.querySelectorAll<HTMLElement>('[data-char-offset]'),
        )
          .filter((entry) =>
            window.getComputedStyle(entry).backgroundColor.includes('255, 224, 102'),
          )
          .map((entry) => Number(entry.getAttribute('data-char-offset') ?? '-1'))
          .filter((offset) => !Number.isNaN(offset));

        if (yellowOffsets.length !== expectedOffsets.length) {
          return false;
        }

        const actualSorted = [...yellowOffsets].sort((a, b) => a - b);
        const expectedSorted = [...expectedOffsets].sort((a, b) => a - b);

        return actualSorted.every((offset, idx) => offset === expectedSorted[idx]);
      }),
    )
    .toBeTruthy();
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
