import { expect, test } from '@playwright/test';
import {
  mockNewsGenerationApi,
  openNewsFeedModal,
  prepareNewsPracticePage,
  resetEmulatorState,
  seedNewsItem,
  waitForPracticeAuth,
} from '../libs/practice';

test.describe('News selectors in feed modal', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('switching complexity does not refetch /getTodayNews', async ({ page }) => {
    const requests: string[] = [];

    await mockNewsGenerationApi(page, {
      onRequest: (body) => {
        requests.push(body?.countryCode ?? 'us');
      },
    });

    await seedNewsItem({
      id: 'settings-news-1',
      title: 'Headline GENERAL 1',
      subTitle: 'Sub 1',
      imageUrl: 'https://images.unsplash.com/a.jpg',
      countryCode: 'us',
      languageCode: 'en',
    });

    await prepareNewsPracticePage(page, { mockGeneration: false });

    const feedModal = await openNewsFeedModal(page);

    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible();
    const requestsAfterInitial = requests.length;
    expect(requestsAfterInitial).toBeGreaterThan(0);

    await page.getByTestId('news-complexity-select').click();
    await page.getByRole('option', { name: 'Advanced' }).click();

    await expect
      .poll(() => requests.length, { timeout: 1_000, intervals: [50, 100, 200] })
      .toBe(requestsAfterInitial);
  });

  test('switching country override refetches with the new country code', async ({ page }) => {
    const countryRequests: string[] = [];

    await mockNewsGenerationApi(page, {
      onRequest: (body) => {
        countryRequests.push(body?.countryCode ?? 'us');
      },
    });

    await seedNewsItem({
      id: 'settings-us-1',
      title: 'Headline US',
      countryCode: 'us',
      languageCode: 'en',
    });
    await seedNewsItem({
      id: 'settings-fr-1',
      title: 'Headline FR',
      countryCode: 'fr',
      languageCode: 'en',
    });

    await prepareNewsPracticePage(page, { mockGeneration: false });

    const feedModal = await openNewsFeedModal(page);

    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible();
    expect(countryRequests.length).toBeGreaterThan(0);
    const requestsBeforeOverride = countryRequests.length;

    await page.getByTestId('news-country-select').click();
    await page.getByRole('option', { name: 'France' }).click();

    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('fr');
    expect(countryRequests.length).toBe(requestsBeforeOverride + 1);
    await expect(feedModal.getByText('Headline FR')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(feedModal).toBeHidden();
    await expect(page).not.toHaveURL(/newsFeed/);

    await page.reload();
    await waitForPracticeAuth(page);

    const feedModal2 = await openNewsFeedModal(page);
    await expect(feedModal2.getByTestId('news-preview-card').first()).toBeVisible();
    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('fr');

    await page.getByTestId('news-country-select').click();
    await page.getByRole('option', { name: 'Auto' }).click();

    await expect
      .poll(() => countryRequests[countryRequests.length - 1], { timeout: 15_000 })
      .toBe('us');
    await expect(feedModal2.getByText('Headline US')).toBeVisible();
  });

  test('category filter shows only matching items and persists in localStorage', async ({
    page,
  }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'cat-general-1',
          title: 'General headline',
          countryCode: 'us',
          languageCode: 'en',
          category: 'general',
        },
        {
          id: 'cat-tech-1',
          title: 'Technology headline',
          countryCode: 'us',
          languageCode: 'en',
          category: 'technology',
        },
      ],
    });

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByText('General headline')).toBeVisible();
    await expect(feedModal.getByText('Technology headline')).toBeVisible();

    await page.getByTestId('news-category-select').click();
    await page.getByRole('option', { name: 'Technology' }).click();

    await expect(feedModal.getByText('Technology headline')).toBeVisible();
    await expect(feedModal.getByText('General headline')).toBeHidden();

    await page.reload();
    await waitForPracticeAuth(page);

    const feedModal2 = page.getByTestId('news-feed-modal');
    await expect(feedModal2).toBeVisible();
    await expect(feedModal2.getByText('Technology headline')).toBeVisible();
    await expect(feedModal2.getByText('General headline')).toBeHidden();
  });
});
