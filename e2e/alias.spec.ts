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

      await expect(page.getByTestId('players-setup')).toBeVisible();
    });

    test('navigates to players setup when Teams is selected', async ({ page }) => {
      await page.goto('/alias');

      const teamsButton = page.getByTestId('mode-teams');
      await teamsButton.click();

      await expect(page.getByTestId('players-setup')).toBeVisible();
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

  test.describe('Players Setup', () => {
    test('shows two default players and disables removing below minimum', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();

      await expect(page.getByTestId('player-name-0')).toBeVisible();
      await expect(page.getByTestId('player-name-1')).toBeVisible();

      const removeFirst = page.getByTestId('player-remove-0');
      await expect(removeFirst).toBeDisabled();
    });

    test('allows adding a player', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();

      await page.getByTestId('add-player').click();

      await expect(page.getByTestId('player-name-2')).toBeVisible();
    });

    test('shows team assignment controls in teams mode', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-teams').click();

      await expect(page.getByTestId('team-name-0')).toBeVisible();
      await expect(page.getByTestId('team-name-1')).toBeVisible();

      await expect(page.getByTestId('player-team-0')).toBeVisible();
      await expect(page.getByTestId('player-team-1')).toBeVisible();
    });

    test('navigates to language level on continue', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();

      await page.getByTestId('players-continue').click();

      await expect(page.getByTestId('language-level')).toBeVisible();
    });
  });

  test.describe('Language Level', () => {
    test('shows difficulty options and updates selection', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();

      const simpleButton = page.getByTestId('language-simple');
      const advancedButton = page.getByTestId('language-advanced');

      await expect(simpleButton).toBeVisible();
      await expect(advancedButton).toBeVisible();

      await advancedButton.click();
      await expect(advancedButton).toHaveAttribute('aria-pressed', 'true');

      await simpleButton.click();
      await expect(simpleButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('navigates to category selection on continue', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();

      await page.getByTestId('language-continue').click();

      await expect(page.getByTestId('category-selection')).toBeVisible();
    });
  });

  test.describe('Category Selection', () => {
    test('displays all categories', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();
      await page.getByTestId('language-continue').click();

      await expect(page.getByTestId('category-animals')).toBeVisible();
      await expect(page.getByTestId('category-food')).toBeVisible();
      await expect(page.getByTestId('category-sports')).toBeVisible();
      await expect(page.getByTestId('category-technology')).toBeVisible();
    });

    test('select all and deselect all controls work', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();
      await page.getByTestId('language-continue').click();

      const continueButton = page.getByTestId('categories-continue');
      await expect(continueButton).toBeDisabled();

      await page.getByTestId('categories-select-all').click();
      await expect(continueButton).toBeEnabled();

      await page.getByTestId('categories-deselect-all').click();
      await expect(continueButton).toBeDisabled();
    });

    test('navigates to round settings on continue', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();
      await page.getByTestId('language-continue').click();

      await page.getByTestId('categories-select-all').click();
      await page.getByTestId('categories-continue').click();

      await expect(page.getByTestId('round-settings')).toBeVisible();
    });
  });

  test.describe('Round Settings', () => {
    test('allows selecting timed and fixed word settings', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();
      await page.getByTestId('language-continue').click();
      await page.getByTestId('categories-select-all').click();
      await page.getByTestId('categories-continue').click();

      await expect(page.getByTestId('round-settings')).toBeVisible();

      await page.getByTestId('turn-type-fixed').click();
      await page.getByTestId('word-count-10').click();

      await page.getByTestId('turn-type-timed').click();
      await page.getByTestId('duration-90').click();
    });

    test('allows setting number of rounds and starting game', async ({ page }) => {
      await page.goto('/alias');
      await page.getByTestId('mode-free-for-all').click();
      await page.getByTestId('players-continue').click();
      await page.getByTestId('language-continue').click();
      await page.getByTestId('categories-select-all').click();
      await page.getByTestId('categories-continue').click();

      await page.getByTestId('rounds-5').click();
      await page.getByTestId('round-settings-start').click();

      await expect(page.getByTestId('turn-start')).toBeVisible();
    });
  });
});
