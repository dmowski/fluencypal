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

  test('opens article on row click, shows markdown, persists in URL, closes via Esc', async ({
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
        topic: 'general' as const,
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

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Click the first row (StoreCard list item).
    await card.getByText('Modal headline ONE', { exact: true }).first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal).toBeVisible({ timeout: 15_000 });
    await expect(modal.getByTestId('news-modal-title')).toHaveText('Modal headline ONE', {
      timeout: 15_000,
    });
    await expect(modal.getByTestId('news-modal-country')).toContainText('United States');
    // Article image is rendered with the item's imageUrl (via next/image,
    // so the rendered src is the optimizer URL containing the original).
    const image = modal.getByTestId('news-modal-image');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute(
      'src',
      /images\.unsplash\.com(?:%2F|\/)m1\.jpg/,
    );
    // Default complexity is `middle` — assert the middle version renders.
    await expect(modal).toContainText('Middle heading');

    // URL reflects the open article.
    await expect(page).toHaveURL(/[?&]newsId=modal-news-1/);

    // Closing via Esc clears the URL param.
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(page).not.toHaveURL(/[?&]newsId=/);
  });
});
