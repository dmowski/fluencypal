import { expect, test } from '@playwright/test';
import { openNewsFeedModal, prepareNewsPracticePage, resetEmulatorState } from '../libs/practice';

test.describe('News modal', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('opens feed on card click, opens article on feed card click, persists URL, Esc closes article then feed', async ({
    page,
  }) => {
    await prepareNewsPracticePage(page, {
      seedItems: [
        {
          id: 'modal-news-1',
          title: 'Modal headline ONE',
          subTitle: 'Sub ONE',
          imageUrl: 'https://images.unsplash.com/m1.jpg',
          countryCode: 'us',
          languageCode: 'en',
          versions: {
            beginner: '# Beginner heading\n\nThis is the beginner version of the article.',
            middle: '# Middle heading\n\nThis is the middle version of the article.',
            advance: '# Advanced heading\n\nThis is the advanced version of the article.',
          },
        },
      ],
    });

    const feedModal = await openNewsFeedModal(page);

    await feedModal.getByTestId('news-preview-card').first().click();

    const modal = page.getByTestId('news-modal');
    await expect(modal.getByTestId('news-modal-title')).toHaveText('Modal headline ONE');
    await expect(modal.getByTestId('news-modal-country')).toContainText('United States');

    const image = modal.getByTestId('news-modal-image');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', /images\.unsplash\.com(?:%2F|\/)m1\.jpg/);

    await expect(modal).toContainText('Middle heading');
    await expect(page).toHaveURL(/[?&]newsId=modal-news-1/);

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(feedModal).toBeVisible();
    await expect(page).not.toHaveURL(/[?&]newsId=/);

    await page.keyboard.press('Escape');
    await expect(feedModal).toBeHidden();
  });
});
