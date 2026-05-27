import { expect, test } from '@playwright/test';
import { openNewsFeedModal, prepareNewsPracticePage, resetEmulatorState } from '../libs/practice';

test.describe('News modal — Comments', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('renders the comments section inside the news article modal', async ({ page }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'comments-news-1',
          title: 'Comments headline',
          imageUrl: 'https://images.unsplash.com/c1.jpg',
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
    await feedModal.getByTestId('news-preview-card').first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal.getByTestId('news-modal-title')).toHaveText('Comments headline');

    const comments = modal.getByTestId('news-comments');
    await expect(comments).toBeVisible();
    await expect(comments).toContainText('Comments');
  });
});
