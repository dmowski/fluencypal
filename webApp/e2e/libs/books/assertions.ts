import { expect, Page } from '@playwright/test';
import {
  getCriticizingWordLocator,
  getReaderHighlightPopoverLocator,
  getYellowHighlightButtonLocator,
} from './locators';

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
  await expect(getReaderHighlightPopoverLocator(page)).toBeVisible({ timeout: 10000 });
  await expect(getYellowHighlightButtonLocator(page)).toBeVisible({ timeout: 10000 });
};

export const assertHighlightPopoverHidden = async (page: Page) => {
  await expect(getReaderHighlightPopoverLocator(page)).not.toBeVisible();
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
          const normalize = (value: string) => value.replace(/[*_~`]+/g, '').trim();
          const candidates = Array.from(
            document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
          );
          const host = candidates.find((entry) => regex.test(normalize(entry.textContent ?? '')));
          if (!host) return false;

          const charSpans = Array.from(host.querySelectorAll<HTMLElement>('[data-char-offset]'));
          if (!charSpans.length) return false;

          const renderedRaw = charSpans.map((entry) => entry.textContent ?? '').join('');
          const rawMatch = renderedRaw.match(regex);

          if (rawMatch && rawMatch.index !== undefined) {
            const targetChars = charSpans.slice(
              rawMatch.index,
              rawMatch.index + rawMatch[0].length,
            );
            if (!targetChars.length) return false;

            return targetChars.every((entry) => {
              const color = window.getComputedStyle(entry).backgroundColor;
              return color.includes('255, 224, 102');
            });
          }

          // When markdown decorators are interleaved in the rendered token,
          // fallback to any highlighted character within the host token.
          const renderedNormalized = normalize(renderedRaw);
          if (!regex.test(renderedNormalized)) {
            return false;
          }

          return charSpans.some((entry) => {
            const color = window.getComputedStyle(entry).backgroundColor;
            return color.includes('255, 224, 102');
          });
        },
        { patternSource: pattern.source, patternFlags: pattern.flags },
      ),
    )
    .toBeTruthy();
};

export const assertOnlyWordHighlightedYellow = async (page: Page, wordText: RegExp | string) => {
  const pattern = typeof wordText === 'string' ? new RegExp(`^${wordText}$`, 'i') : wordText;

  await expect
    .poll(async () =>
      page.evaluate(
        ({ patternSource, patternFlags }) => {
          const regex = new RegExp(patternSource, patternFlags);
          const normalize = (value: string) => value.replace(/[*_~`]+/g, '').trim();
          const isYellow = (entry: HTMLElement) =>
            window.getComputedStyle(entry).backgroundColor.includes('255, 224, 102');

          const candidates = Array.from(
            document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
          );
          const host = candidates.find((entry) => regex.test(normalize(entry.textContent ?? '')));
          if (!host) return { ok: false, reason: 'host-not-found' };

          const paragraphRoot = host.closest('.MuiTypography-root') as HTMLElement | null;
          if (!paragraphRoot) return { ok: false, reason: 'paragraph-root-not-found' };

          const hostChars = Array.from(host.querySelectorAll<HTMLElement>('[data-char-offset]'));
          if (!hostChars.length) return { ok: false, reason: 'host-chars-not-found' };

          const rendered = hostChars.map((entry) => entry.textContent ?? '').join('');
          const match = rendered.match(regex);
          if (!match || match.index === undefined) {
            return { ok: false, reason: 'word-match-not-found', rendered };
          }

          const matchedChars = hostChars.slice(match.index, match.index + match[0].length);
          if (!matchedChars.length) return { ok: false, reason: 'matched-chars-empty' };

          const matchedOffsets = matchedChars
            .map((entry) => Number(entry.getAttribute('data-char-offset') ?? '-1'))
            .filter((offset) => !Number.isNaN(offset));
          if (!matchedOffsets.length) return { ok: false, reason: 'matched-offsets-empty' };

          const allWordCharsHighlighted = matchedChars.every((entry) => isYellow(entry));
          if (!allWordCharsHighlighted) {
            const yellowChars = Array.from(
              paragraphRoot.querySelectorAll<HTMLElement>('[data-char-offset]'),
            )
              .filter((entry) => isYellow(entry))
              .map((entry) => ({
                char: entry.textContent ?? '',
                offset: Number(entry.getAttribute('data-char-offset') ?? '-1'),
              }))
              .filter((entry) => !Number.isNaN(entry.offset))
              .sort((a, b) => a.offset - b.offset)
              .slice(0, 24);

            return {
              ok: false,
              reason: 'word-not-fully-yellow',
              matchedChars: matchedChars.map((entry) => ({
                char: entry.textContent ?? '',
                offset: Number(entry.getAttribute('data-char-offset') ?? '-1'),
                yellow: isYellow(entry),
              })),
              yellowChars,
            };
          }

          const endOffset = Math.max(...matchedOffsets);

          const trailingSpace = paragraphRoot.querySelector<HTMLElement>(
            `[data-char-offset="${endOffset + 1}"]`,
          );
          if (
            trailingSpace &&
            (trailingSpace.textContent ?? '') === ' ' &&
            isYellow(trailingSpace)
          ) {
            return { ok: false, reason: 'trailing-space-yellow', endOffset };
          }

          const paragraphChars = Array.from(
            paragraphRoot.querySelectorAll<HTMLElement>('[data-char-offset]'),
          )
            .map((entry) => {
              const offset = Number(entry.getAttribute('data-char-offset') ?? '-1');
              return Number.isNaN(offset)
                ? null
                : {
                    entry,
                    offset,
                    char: entry.textContent ?? '',
                  };
            })
            .filter(
              (
                entry,
              ): entry is {
                entry: HTMLElement;
                offset: number;
                char: string;
              } => entry !== null,
            )
            .sort((a, b) => a.offset - b.offset);

          const nextVisibleChar = paragraphChars.find(
            (entry) => entry.offset > endOffset && entry.char.trim().length > 0,
          );

          if (nextVisibleChar && isYellow(nextVisibleChar.entry)) {
            return {
              ok: false,
              reason: 'next-visible-char-yellow',
              nextChar: nextVisibleChar.char,
              nextOffset: nextVisibleChar.offset,
            };
          }

          return { ok: true };
        },
        { patternSource: pattern.source, patternFlags: pattern.flags },
      ),
    )
    .toEqual({ ok: true });
};

export const assertPhraseHighlightedYellowWithSpaces = async (page: Page, phrase: string) => {
  await expect
    .poll(async () =>
      page.evaluate((targetPhrase) => {
        const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();
        const normalizedTarget = normalizeWhitespace(targetPhrase).toLowerCase();

        const paragraphCandidates = Array.from(
          document.querySelectorAll<HTMLElement>('[data-reader-paragraph-start-offset]'),
        );
        const paragraph = paragraphCandidates.find((entry) =>
          normalizeWhitespace(entry.textContent ?? '')
            .toLowerCase()
            .includes(normalizedTarget),
        );
        if (!paragraph) return false;

        const chars = Array.from(paragraph.querySelectorAll<HTMLElement>('[data-char-offset]'))
          .map((entry) => {
            const offset = Number(entry.getAttribute('data-char-offset') ?? '-1');
            if (Number.isNaN(offset)) {
              return null;
            }

            return {
              offset,
              char: entry.textContent ?? '',
              yellow: window.getComputedStyle(entry).backgroundColor.includes('255, 224, 102'),
            };
          })
          .filter(
            (entry): entry is { offset: number; char: string; yellow: boolean } => entry !== null,
          )
          .sort((a, b) => a.offset - b.offset);

        if (!chars.length) return false;

        const renderedText = chars.map((entry) => entry.char).join('');
        const normalizedRendered = normalizeWhitespace(renderedText).toLowerCase();
        const phraseStart = normalizedRendered.indexOf(normalizedTarget);
        if (phraseStart < 0) return false;

        const phraseEntries = chars.slice(phraseStart, phraseStart + normalizedTarget.length);
        if (phraseEntries.length !== normalizedTarget.length) return false;

        const expectedSpaceCount = (normalizedTarget.match(/ /g) ?? []).length;
        const highlightedSpaceCount = phraseEntries.filter(
          (entry) => entry.char === ' ' && entry.yellow,
        ).length;

        return (
          phraseEntries.every((entry) => entry.yellow) &&
          highlightedSpaceCount === expectedSpaceCount
        );
      }, phrase),
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
