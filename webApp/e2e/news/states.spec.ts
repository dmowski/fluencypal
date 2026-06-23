import { expect, test } from '@playwright/test';
import {
  mockNewsGenerationApi,
  openNewsFeedModal,
  prepareNewsPracticePage,
  resetEmulatorState,
  seedNewsItem,
} from '../libs/practice';

test.describe.skip('News states', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('feed modal leaves loading state once Firestore data is available', async ({ page }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'loading-news-1',
          title: 'Loaded headline',
          countryCode: 'us',
          languageCode: 'en',
        },
      ],
    });

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByTestId('news-feed-modal-loading')).toBeHidden();
    await expect(feedModal.getByText('Loaded headline')).toBeVisible();
  });

  test('shows empty message in feed modal when no news exist', async ({ page }) => {
    await prepareNewsPracticePage(page);

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByTestId('news-feed-modal-empty')).toBeVisible();
  });

  test('falls back to US news when the user has no country set', async ({ page }) => {
    let observedCountry: string | null = null;

    await mockNewsGenerationApi(page, {
      onRequest: (body) => {
        observedCountry = body?.countryCode ?? null;
      },
    });

    await seedNewsItem({
      id: 'fallback-news-1',
      title: 'US fallback headline',
      imageUrl: 'https://images.unsplash.com/fb1.jpg',
      countryCode: 'us',
      languageCode: 'en',
    });

    const { uid } = await prepareNewsPracticePage(page, { mockGeneration: false });

    await page.evaluate((userId) => {
      const handle = (window as any).__darkEngTest;
      const ref = handle.doc(handle.firestore, 'users', userId);
      return handle.setDoc(ref, { country: null, countryName: null }, { merge: true });
    }, uid);

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByText('US fallback headline').first()).toBeVisible();
    expect(observedCountry).toBe('us');
  });

  test('getNewsFullText failure shows fallback message when complexity text is missing', async ({
    page,
  }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'err-news-1',
          title: 'Error headline',
          imageUrl: 'https://images.unsplash.com/e1.jpg',
          countryCode: 'us',
          languageCode: 'en',
          versions: { middle: '# Middle\n\nCached body.' },
        },
      ],
    });

    await page.route('**/api/news/getNewsFullText', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'boom' }),
      });
    });

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible();

    await page.getByTestId('news-complexity-select').click();
    await page.getByRole('option', { name: 'Advanced' }).click();

    await feedModal.getByTestId('news-preview-card').first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal.getByTestId('news-modal-title')).toHaveText('Error headline');
    await expect(modal).toContainText('Try a different level');
  });
});
