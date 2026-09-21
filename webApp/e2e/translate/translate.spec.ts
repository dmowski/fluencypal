import { expect, test } from '@playwright/test';

const mockTranslations = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/translate', async (route) => {
    const request = route.request().postDataJSON() as {
      text?: string;
      targetLanguage?: string;
    };
    const translations: Record<string, string> = {
      en: 'Hello',
      ru: 'Привет',
      pl: 'Cześć',
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        translatedText: translations[request.targetLanguage || ''] || `${request.text || ''}-tr`,
      }),
    });
  });
};

test.describe('Translation page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('translation-page-settings-v1');
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith('translate_')) {
          window.localStorage.removeItem(key);
        }
      }
    });
  });

  test('translates typed text into the other columns', async ({ page }) => {
    await mockTranslations(page);
    await page.goto('/translate');

    await expect(page.getByTestId('translation-page')).toBeVisible();
    await expect(page.getByTestId('translation-column-ru')).toBeVisible();
    await expect(page.getByTestId('translation-column-pl')).toBeVisible();
    await expect(page.getByTestId('translation-column-en')).toBeVisible();

    await page.getByTestId('translation-textarea-pl').fill('hej');

    await expect(page.getByTestId('translation-textarea-en')).toHaveValue('Hello');
    await expect(page.getByTestId('translation-textarea-ru')).toHaveValue('Привет');
    await expect(page.getByTestId('translation-textarea-pl')).toHaveValue('hej');
  });

  test('pastes into the hovered column when no textarea is focused', async ({ page }) => {
    await mockTranslations(page);
    await page.goto('/translate');

    await page.getByTestId('translation-column-en').hover();
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });

    await page.evaluate(() => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', 'hello there');
      const event = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData,
      });
      window.dispatchEvent(event);
    });

    await expect(page.getByTestId('translation-textarea-en')).toHaveValue('hello there');
    await expect(page.getByTestId('translation-textarea-pl')).toHaveValue('Cześć');
    await expect(page.getByTestId('translation-textarea-ru')).toHaveValue('Привет');
  });

  test('can turn voice over off', async ({ page }) => {
    await page.goto('/translate');
    const toggle = page.getByTestId('translation-voice-over-toggle');
    await expect(toggle).toContainText('Voice over on');
    await toggle.click();
    await expect(toggle).toContainText('Voice over off');
  });
});
