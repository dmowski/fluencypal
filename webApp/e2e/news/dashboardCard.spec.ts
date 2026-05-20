import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('News dashboard card', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows the news dashboard card on the practice dashboard', async ({ page }) => {
    test.setTimeout(90_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
  });

  test('shows static title and label on the store card', async ({ page }) => {
    test.setTimeout(90_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    await expect(card.getByText('Discuss with AI')).toBeVisible();
    await expect(card.getByText(/inspired by current events/i)).toBeVisible();
  });

  test('clicking the preview card opens the news feed modal', async ({ page }) => {
    test.setTimeout(90_000);

    const fixtureItems = [
      {
        id: 'n1',
        title: 'Mocked headline ONE',
        subTitle: 'Sub ONE',
        imageUrl: 'https://images.unsplash.com/n1.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        languageCode: 'en',
      },
    ];

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: fixtureItems }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    await card.click();

    await expect(page.getByTestId('news-feed-modal')).toBeVisible({ timeout: 15_000 });
  });
});
