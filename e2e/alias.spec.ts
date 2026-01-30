import { test, expect } from '@playwright/test';

test.describe('Alias Game', () => {
  test('Render Alias Game page', async ({ page }) => {
    await page.goto('/alias');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');
  });

  test.describe('Mode Selection', () => {
    test('displays both game mode options', async ({ page }) => {
      await page.goto('/alias');

      // Check that both mode buttons are visible
      const freeForAllButton = page.getByTestId('mode-free-for-all');
      const teamsButton = page.getByTestId('mode-teams');

      await expect(freeForAllButton).toBeVisible();
      await expect(teamsButton).toBeVisible();

      // Check button text content
      await expect(freeForAllButton).toContainText('Free-for-All');
      await expect(freeForAllButton).toContainText('Every player competes individually');

      await expect(teamsButton).toContainText('Teams');
      await expect(teamsButton).toContainText('Players compete in teams');
    });

    test('navigates to players setup when Free-for-All is selected', async ({ page }) => {
      await page.goto('/alias');

      const freeForAllButton = page.getByTestId('mode-free-for-all');
      await freeForAllButton.click();

      // After clicking, the mode selection should disappear
      // (In the future, we'll check for players setup screen)
      await expect(freeForAllButton).not.toBeVisible();
    });

    test('navigates to players setup when Teams is selected', async ({ page }) => {
      await page.goto('/alias');

      const teamsButton = page.getByTestId('mode-teams');
      await teamsButton.click();

      // After clicking, the mode selection should disappear
      await expect(teamsButton).not.toBeVisible();
    });

    test('is responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/alias');

      const freeForAllButton = page.getByTestId('mode-free-for-all');
      const teamsButton = page.getByTestId('mode-teams');

      // Buttons should be visible and clickable on mobile
      await expect(freeForAllButton).toBeVisible();
      await expect(teamsButton).toBeVisible();

      // Check buttons are large enough for touch (at least 44px height)
      const freeForAllBox = await freeForAllButton.boundingBox();
      const teamsBox = await teamsButton.boundingBox();

      expect(freeForAllBox?.height).toBeGreaterThanOrEqual(44);
      expect(teamsBox?.height).toBeGreaterThanOrEqual(44);
    });
  });
});
