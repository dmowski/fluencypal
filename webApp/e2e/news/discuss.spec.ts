import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('News modal — Discuss with AI', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('renders an enabled Discuss with AI button wired up in the news modal', async ({ page }) => {
    test.setTimeout(90_000);

    const fixtureItems = [
      {
        id: 'discuss-news-1',
        title: 'Discuss headline',
        subTitle: '',
        imageUrl: 'https://images.unsplash.com/d1.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        languageCode: 'en',
      },
    ];

    const fullItem = {
      ...fixtureItems[0],
      content_origin: 'origin body',
      sourceImageUrl: '',
      sourceUrl: 'https://example.com/d1',
      countryName: 'United States',
      createdAtIso: new Date().toISOString(),
      versions: {
        beginner: '# Beginner\n\nBeginner body.',
        middle: '# Middle\n\nMiddle body.',
        advance: '# Advanced\n\nAdvanced body.',
      },
    };

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: fixtureItems }),
      });
    });
    await page.route('**/api/news/getNewsById', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ item: fullItem }),
      });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Open the feed modal, then click the news preview card to open the article.
    await card.click();
    const feedModal = page.getByTestId('news-feed-modal');
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible({
      timeout: 15_000,
    });
    await feedModal.getByTestId('news-preview-card').first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal).toBeVisible({ timeout: 15_000 });

    // Button is wired: enabled (no longer the disabled "Coming soon" placeholder)
    // and shows the expected label. We deliberately do not click it here because
    // a real click would spin up a live realtime conversation (mic permission +
    // backend session), which is out of scope for this regression spec — Step 12
    // only owns the wiring.
    const discussButton = modal.getByTestId('news-modal-discuss-button');
    await expect(discussButton).toBeVisible();
    await expect(discussButton).toBeEnabled();
    await expect(discussButton).toContainText('Discuss with AI');
    await expect(modal).not.toContainText('Coming soon');
  });
});
