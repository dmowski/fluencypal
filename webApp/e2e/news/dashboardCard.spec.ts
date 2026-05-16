import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('News dashboard card', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows the Current Events section on the practice dashboard', async ({ page }) => {
    test.setTimeout(90_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    await expect(card.getByRole('heading', { name: 'Current Events' })).toBeVisible();
    await expect(
      card.getByText('AI-generated English learning content inspired by current events'),
    ).toBeVisible();
  });

  test('renders mocked today news: badge, headline title, three row items', async ({ page }) => {
    test.setTimeout(90_000);

    const fixtureItems = [
      {
        id: 'n1',
        title: 'Mocked headline ONE',
        subTitle: 'Sub ONE',
        imageUrl: 'https://example.com/1.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        topic: 'general',
      },
      {
        id: 'n2',
        title: 'Mocked headline TWO',
        subTitle: 'Sub TWO',
        imageUrl: 'https://example.com/2.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        topic: 'general',
      },
      {
        id: 'n3',
        title: 'Mocked headline THREE',
        subTitle: 'Sub THREE',
        imageUrl: 'https://example.com/3.jpg',
        dateIso: new Date().toISOString(),
        countryCode: 'us',
        topic: 'general',
      },
    ];

    await page.route('**/api/news/getTodayNews', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: fixtureItems }),
      });
    });

    // Avoid flaky third-party fetch failing in CI/dev mode, which surfaces a
    // Next.js dev-error overlay covering the dashboard.
    await page.route('**/ipapi.co/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'USD' });
    });

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Country badge.
    await expect(card.getByText('United States', { exact: true })).toBeVisible();

    // First item title is the card headline.
    await expect(card.getByText('Mocked headline ONE', { exact: true })).toBeVisible();

    // All three rows render with their titles.
    await expect(card.getByText('Mocked headline ONE', { exact: true })).toBeVisible();
    await expect(card.getByText('Mocked headline TWO', { exact: true })).toBeVisible();
    await expect(card.getByText('Mocked headline THREE', { exact: true })).toBeVisible();
  });
});
