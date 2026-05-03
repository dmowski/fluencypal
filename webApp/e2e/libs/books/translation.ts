import { Page } from '@playwright/test';

export const mockSingleTranslation = async (page: Page, translatedText: string) => {
  let translateRequestsCount = 0;

  await page.route('**/api/translate', async (route) => {
    translateRequestsCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        translatedText,
      }),
    });
  });

  return {
    getCount: () => translateRequestsCount,
  };
};
