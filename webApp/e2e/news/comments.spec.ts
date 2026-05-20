import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

const fixtureItems = [
  {
    id: 'comments-news-1',
    title: 'Comments headline',
    subTitle: '',
    imageUrl: 'https://images.unsplash.com/c1.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    languageCode: 'en',
  },
];

const fullItem = {
  ...fixtureItems[0],
  content_origin: 'origin body',
  sourceImageUrl: '',
  sourceUrl: 'https://example.com/c1',
  countryName: 'United States',
  createdAtIso: new Date().toISOString(),
  versions: {
    beginner: '# Beginner\n\nBeginner body.',
    middle: '# Middle\n\nMiddle body.',
    advance: '# Advanced\n\nAdvanced body.',
  },
};

const openNewsModal = async (page: import('@playwright/test').Page) => {
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
  await card.click();

  const feedModal = page.getByTestId('news-feed-modal');
  await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible({
    timeout: 15_000,
  });
  await feedModal.getByTestId('news-preview-card').first().click();

  const modal = page.getByTestId('news-modal');
  await expect(modal.getByTestId('news-modal-title')).toHaveText('Comments headline', {
    timeout: 15_000,
  });
  return modal;
};

test.describe('News modal — Comments', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('renders the comments section inside the news article modal', async ({ page }) => {
    test.setTimeout(90_000);

    const modal = await openNewsModal(page);

    const comments = modal.getByTestId('news-comments');
    await expect(comments).toBeVisible({ timeout: 15_000 });
    await expect(comments).toContainText('Comments');
  });
});
