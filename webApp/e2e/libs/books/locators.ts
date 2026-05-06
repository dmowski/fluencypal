import { Page } from '@playwright/test';

export const getCriticizingWordLocator = async (page: Page) => {
  const orderedSelectors = ['[data-word-index]', '.conversation-word', 'p span', 'div span'];

  for (const selector of orderedSelectors) {
    const candidate = page
      .locator(selector)
      .filter({ hasText: /\bcriticizing\b/i })
      .first();
    const exists = (await candidate.count()) > 0;
    if (!exists) {
      continue;
    }

    if (await candidate.isVisible()) {
      return candidate;
    }
  }

  throw new Error('Could not find visible criticizing word in reader content.');
};

export const getReaderHighlightPopoverLocator = (page: Page) =>
  page.getByTestId('reader-text-popover');

export const getYellowHighlightButtonLocator = (page: Page) =>
  page.getByTestId('reader-highlight-color-Y');
