import { expect, test } from '@playwright/test';
import { openNewsFeedModal, prepareNewsPracticePage, resetEmulatorState } from '../libs/practice';

test.describe('News modal — Discuss with AI', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('renders an enabled Discuss with AI button wired up in the news modal', async ({ page }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'discuss-news-1',
          title: 'Discuss headline',
          imageUrl: 'https://images.unsplash.com/d1.jpg',
          countryCode: 'us',
          languageCode: 'en',
          versions: {
            beginner: '# Beginner\n\nBeginner body.',
            middle: '# Middle\n\nMiddle body.',
            advance: '# Advanced\n\nAdvanced body.',
          },
        },
      ],
    });

    const feedModal = await openNewsFeedModal(page);
    await expect(feedModal.getByTestId('news-preview-card').first()).toBeVisible();
    await feedModal.getByTestId('news-preview-card').first().click();

    const modal = page.getByTestId('news-modal');
    const discussButton = modal.getByTestId('news-modal-discuss-button');
    await expect(discussButton).toBeVisible();
    await expect(discussButton).toBeEnabled();
    await expect(discussButton).toContainText('Discuss with AI');
    await expect(modal).not.toContainText('Coming soon');
  });
});
