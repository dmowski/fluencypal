import { expect, test } from '@playwright/test';
import {
  openNewsFeedModal,
  prepareNewsPracticePage,
  resetEmulatorState,
} from '../libs/practice';

test.describe('News dashboard card', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows the news dashboard card on the practice dashboard', async ({ page }) => {
    await prepareNewsPracticePage(page);

    await expect(page.getByTestId('news-dashboard-card')).toBeVisible();
  });

  test('shows static title and label on the store card', async ({ page }) => {
    await prepareNewsPracticePage(page);

    const card = page.getByTestId('news-dashboard-card');
    await expect(card.getByText('Discuss with AI')).toBeVisible();
    await expect(card.getByText(/inspired by current events/i)).toBeVisible();
  });

  test('clicking the preview card opens the news feed modal', async ({ page }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'n1',
          title: 'Mocked headline ONE',
          subTitle: 'Sub ONE',
          imageUrl: 'https://images.unsplash.com/n1.jpg',
          countryCode: 'us',
          languageCode: 'en',
        },
      ],
    });

    await openNewsFeedModal(page);
  });
});
