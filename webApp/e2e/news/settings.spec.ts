import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

const makeFixture = (topic: string) => [
  {
    id: `${topic}-1`,
    title: `Headline ${topic.toUpperCase()} 1`,
    subTitle: 'Sub 1',
    imageUrl: 'https://images.unsplash.com/a.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    topic,
  },
  {
    id: `${topic}-2`,
    title: `Headline ${topic.toUpperCase()} 2`,
    subTitle: 'Sub 2',
    imageUrl: 'https://images.unsplash.com/b.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    topic,
  },
  {
    id: `${topic}-3`,
    title: `Headline ${topic.toUpperCase()} 3`,
    subTitle: 'Sub 3',
    imageUrl: 'https://images.unsplash.com/c.jpg',
    dateIso: new Date().toISOString(),
    countryCode: 'us',
    topic,
  },
];

test.describe('News settings menu', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('switching topic refetches with new topic; switching complexity does not refetch', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const topicRequests: string[] = [];

    await page.route('**/api/news/getTodayNews', async (route) => {
      const request = route.request();
      const body = request.postDataJSON() as { topic?: string } | null;
      const topic = body?.topic ?? 'general';
      topicRequests.push(topic);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: makeFixture(topic) }),
      });
    });

    await page.route('**/ipapi.co/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'USD' });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Initial fetch for default topic.
    await expect(card.getByText('Headline GENERAL 1', { exact: true }).first()).toBeVisible();
    expect(topicRequests).toContain('general');
    const requestsAfterInitial = topicRequests.length;

    // Open the settings menu.
    await page.getByTestId('news-settings-button').click();
    await expect(page.getByTestId('news-settings-menu')).toBeVisible();

    // Switching complexity should NOT issue another /getTodayNews request.
    await page.getByTestId('news-complexity-option-advance').click();

    // Re-open menu (complexity click does not close in current impl, but stay safe).
    const menu = page.getByTestId('news-settings-menu');
    if (!(await menu.isVisible())) {
      await page.getByTestId('news-settings-button').click();
    }

    // Switch topic to technology → triggers new request.
    await page.getByTestId('news-topic-option-technology').click();

    // Wait for the new topic content to appear.
    await expect(card.getByText('Headline TECHNOLOGY 1', { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });

    expect(topicRequests).toContain('technology');
    // After complexity change there should be no extra request beyond initial,
    // only the topic switch added one.
    expect(topicRequests.length).toBe(requestsAfterInitial + 1);
  });
});
