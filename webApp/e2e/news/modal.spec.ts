import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('News modal', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('opens feed on card click, opens article on feed card click, persists URL, Esc closes article then feed', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const fixtureItems = [
      {
        id: 'modal-news-1',
        title: 'Modal headline ONE',
        subTitle: 'Sub ONE',
        imageUrl: 'https://images.unsplash.com/m1.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        languageCode: 'en',
      },
    ];

    const fullItem = {
      ...fixtureItems[0],
      content_origin: 'origin body',
      sourceImageUrl: '',
      sourceUrl: 'https://example.com/m1',
      countryName: 'United States',
      createdAtIso: new Date().toISOString(),
      versions: {
        beginner: '# Beginner heading\n\nThis is the beginner version of the article.',
        middle: '# Middle heading\n\nThis is the middle version of the article.',
        advance: '# Advanced heading\n\nThis is the advanced version of the article.',
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

    // Step 1: click the dashboard preview card to open the feed modal.
    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click();

    const feedModal = page.getByTestId('news-feed-modal');
    await expect(feedModal).toBeVisible({ timeout: 15_000 });

    // Step 2: click a news preview card in the feed to open the article.
    await feedModal.getByTestId('news-preview-card').first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await expect(modal.getByTestId('news-modal-title')).toHaveText('Modal headline ONE', {
      timeout: 15_000,
    });
    await expect(modal.getByTestId('news-modal-country')).toContainText('United States');

    // Article image rendered via next/image optimiser URL.
    const image = modal.getByTestId('news-modal-image');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', /images\.unsplash\.com(?:%2F|\/)m1\.jpg/);

    // Default complexity is `middle`.
    await expect(modal).toContainText('Middle heading');

    // URL reflects both feed and article open.
    await expect(page).toHaveURL(/[?&]newsId=modal-news-1/);

    // Step 3: Esc closes the article but the feed modal stays visible.
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(feedModal).toBeVisible();
    await expect(page).not.toHaveURL(/[?&]newsId=/);

    // Step 4: Esc again closes the feed modal.
    await page.keyboard.press('Escape');
    await expect(feedModal).toBeHidden();
  });
});
