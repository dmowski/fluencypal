import { test, expect } from '@playwright/test';
import {
  navigateToModeSelection,
  selectGameMode,
  setupPlayers,
  selectLanguageLevel,
  startGameplay,
  navigateFullSetup,
} from './helpers';

test.describe('Alias Game', () => {
  test('Render Alias Game page and verify mode selection', async ({ page }) => {
    await navigateToModeSelection(page);

    // Verify both modes are visible with correct text
    const freeForAllButton = page.getByTestId('mode-free-for-all');
    const teamsButton = page.getByTestId('mode-teams');

    await expect(freeForAllButton).toBeVisible();
    await expect(teamsButton).toBeVisible();
    await expect(freeForAllButton).toContainText('Free-for-All');
    await expect(freeForAllButton).toContainText('Every player competes individually');
    await expect(teamsButton).toContainText('Teams');
    await expect(teamsButton).toContainText('Players compete in teams');

    // Verify responsive on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const freeForAllBox = await freeForAllButton.boundingBox();
    const teamsBox = await teamsButton.boundingBox();
    expect(freeForAllBox?.height).toBeGreaterThanOrEqual(44);
    expect(teamsBox?.height).toBeGreaterThanOrEqual(44);
  });

  test.describe('Mode Selection & Navigation', () => {
    test('both game modes navigate to players setup', async ({ page }) => {
      // Test Free-for-All mode
      await navigateToModeSelection(page);
      await selectGameMode(page, 'free-for-all');
      await expect(page.getByTestId('player-name-0')).toBeVisible();
      await expect(page.getByTestId('player-name-1')).toBeVisible();

      // Test Teams mode
      await page.goto('/alias');
      await selectGameMode(page, 'teams');
      await expect(page.getByTestId('team-name-0')).toBeVisible();
      await expect(page.getByTestId('team-name-1')).toBeVisible();
    });
  });

  test.describe('Players Setup & Language Level', () => {
    test('player management and language difficulty selection', async ({ page }) => {
      await navigateToModeSelection(page);
      await selectGameMode(page, 'free-for-all');

      // Test player constraints
      const removeFirst = page.getByTestId('player-remove-0');
      await expect(removeFirst).toBeDisabled();

      // Test adding players
      await page.getByTestId('add-player').click();
      await expect(page.getByTestId('player-name-2')).toBeVisible();

      await page.getByTestId('players-continue').click();
      await expect(page.getByTestId('language-level')).toBeVisible();

      // Test language difficulty selection
      const simpleButton = page.getByTestId('language-simple');
      const advancedButton = page.getByTestId('language-advanced');

      await expect(simpleButton).toBeVisible();
      await expect(advancedButton).toBeVisible();

      await advancedButton.click();
      await expect(advancedButton).toHaveAttribute('aria-pressed', 'true');

      await simpleButton.click();
      await expect(simpleButton).toHaveAttribute('aria-pressed', 'true');

      await page.getByTestId('language-continue').click();
      await expect(page.getByTestId('category-selection')).toBeVisible();
    });

    test('teams mode shows team assignment controls', async ({ page }) => {
      await navigateToModeSelection(page);
      await selectGameMode(page, 'teams');

      await expect(page.getByTestId('team-name-0')).toBeVisible();
      await expect(page.getByTestId('team-name-1')).toBeVisible();
      await expect(page.getByTestId('player-team-0')).toBeVisible();
      await expect(page.getByTestId('player-team-1')).toBeVisible();
    });
  });

  test.describe('Category Selection & Round Settings', () => {
    test('category selection and round configuration', async ({ page }) => {
      await navigateFullSetup(page);

      // Verify categories are displayed (we already know we're on category selection from helper)
      // Go back to test category display
      await page.goto('/alias');
      await selectGameMode(page, 'free-for-all');
      await setupPlayers(page);
      await selectLanguageLevel(page);

      await expect(page.getByTestId('category-animals')).toBeVisible();
      await expect(page.getByTestId('category-food')).toBeVisible();
      await expect(page.getByTestId('category-sports')).toBeVisible();
      await expect(page.getByTestId('category-technology')).toBeVisible();

      // Test select/deselect all
      const continueButton = page.getByTestId('categories-continue');
      await expect(continueButton).toBeDisabled();

      await page.getByTestId('categories-select-all').click();
      await expect(continueButton).toBeEnabled();

      await page.getByTestId('categories-deselect-all').click();
      await expect(continueButton).toBeDisabled();

      await page.getByTestId('categories-select-all').click();
      await page.getByTestId('categories-continue').click();
      await expect(page.getByTestId('round-settings')).toBeVisible();

      // Test round settings options
      await page.getByTestId('turn-type-fixed').click();
      await page.getByTestId('word-count-10').click();

      await page.getByTestId('turn-type-timed').click();
      await page.getByTestId('duration-90').click();

      // Test number of rounds
      await page.getByTestId('rounds-5').click();
      await page.getByTestId('round-settings-start').click();

      await expect(page.getByTestId('turn-start')).toBeVisible();
      await expect(page.getByTestId('turn-start-player')).toContainText('Player 1');
    });
  });

  test.describe('Gameplay & Scoring', () => {
    test('gameplay interactions with timed mode', async ({ page }) => {
      await navigateFullSetup(page, 'free-for-all', { mode: 'timed' });
      await startGameplay(page);

      // Verify timed mode display
      await expect(page.getByTestId('word-card-text')).toBeVisible();
      await expect(page.getByTestId('button-correct')).toBeVisible();
      await expect(page.getByTestId('button-skip')).toBeVisible();
      await expect(page.getByTestId('timer')).toBeVisible();

      // Test word changing with interactions
      const wordCard = page.getByTestId('word-card-text');
      const firstWord = await wordCard.textContent();

      await page.getByTestId('button-correct').click();
      const secondWord = await wordCard.textContent();

      await page.getByTestId('button-skip').click();
      const thirdWord = await wordCard.textContent();

      expect(firstWord).not.toBeNull();
      expect(secondWord).not.toBeNull();
      expect(thirdWord).not.toBeNull();
      expect(secondWord).not.toBe(firstWord);
      expect(thirdWord).not.toBe(secondWord);
    });

    test('gameplay with fixed words mode and counter', async ({ page }) => {
      await navigateFullSetup(page, 'free-for-all', { mode: 'fixed', value: 5 });
      await startGameplay(page);

      // Verify fixed mode display
      const counter = page.getByTestId('word-counter');
      await expect(counter).toBeVisible();

      // Interact with words and verify counter updates
      await page.getByTestId('button-correct').click();
      await expect(counter).toContainText(/1\s*\/\s*5/);

      await page.getByTestId('button-correct').click();
      await expect(counter).toContainText(/2\s*\/\s*5/);

      await page.getByTestId('button-skip').click();
      await expect(counter).toContainText(/3\s*\/\s*5/);
    });
  });

  test.describe('Turn Summary & Multi-turn Flow', () => {
    test('fixed-words turn summary with accurate scoring and next turn', async ({ page }) => {
      await navigateFullSetup(page, 'free-for-all', { mode: 'fixed', value: 5, rounds: 2 });
      await startGameplay(page);

      const counter = page.getByTestId('word-counter');

      // Play first turn: 3 correct, 2 skip => score 1
      await page.getByTestId('button-correct').click();
      await expect(counter).toContainText(/1\s*\/\s*5/);
      await page.getByTestId('button-correct').click();
      await expect(counter).toContainText(/2\s*\/\s*5/);
      await page.getByTestId('button-correct').click();
      await expect(counter).toContainText(/3\s*\/\s*5/);
      await page.getByTestId('button-skip').click();
      await expect(counter).toContainText(/4\s*\/\s*5/);
      await page.getByTestId('button-skip').click();

      // Verify turn summary
      await expect(page.getByTestId('turn-summary')).toBeVisible();
      await expect(page.getByTestId('turn-summary-correct')).toContainText('3');
      await expect(page.getByTestId('turn-summary-skip')).toContainText('2');
      await expect(page.getByTestId('turn-summary-score')).toContainText('1');
      await expect(page.getByTestId('turn-summary-player')).toContainText('Player 1');

      const totalScoreEntry = page.getByTestId(/total-score-/).first();
      await expect(totalScoreEntry).toContainText('1');

      // Verify next turn
      await page.getByTestId('turn-summary-next').click();
      await expect(page.getByTestId('turn-start')).toBeVisible();
      await expect(page.getByTestId('turn-start-player')).toContainText('Player 2');
    });
  });

  test.describe('Round Progression', () => {
    test('should increment round after all players complete their turn', async ({ page }) => {
      await navigateFullSetup(page, 'free-for-all', { mode: 'fixed', value: 5, rounds: 2 });
      await startGameplay(page);

      // Player 1 completes first turn
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('button-correct').click();
      }

      // Go to scoreboard from turn summary
      await page.getByTestId('turn-summary-view-scoreboard').click();
      await expect(page.getByTestId('scoreboard')).toBeVisible();

      // Verify scoreboard shows Round 1
      let roundDisplay = page.locator('text=/Round 1 \\/ 2/');
      await expect(roundDisplay).toBeVisible();

      // Continue to next turn
      await page.getByTestId('scoreboard-continue').click();
      await expect(page.getByTestId('turn-start-player')).toContainText('Player 2');
      await page.getByTestId('turn-start-button').click();
      await expect(page.getByTestId('gameplay')).toBeVisible();

      // Player 2 completes their turn
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('button-correct').click();
      }

      // After round 1 completes, should go to turn start for new round
      await page.getByTestId('turn-summary-next').click();
      await expect(page.getByTestId('turn-start')).toBeVisible();

      // Check that we're now in Round 2
      roundDisplay = page.locator('text=/Round 2 \\/ 2/');
      await expect(roundDisplay).toBeVisible();

      // Verify scoreboard shows Round 2
      await page.getByTestId('turn-summary-view-scoreboard').click();
      roundDisplay = page.locator('text=/Round 2 \\/ 2/');
      await expect(roundDisplay).toBeVisible();
    });
  });

  test.describe('Scoreboard Visibility & Styling', () => {
    test('scoreboard should have visible text (not white on white)', async ({ page }) => {
      await navigateFullSetup(page, 'free-for-all', { mode: 'fixed', value: 5, rounds: 1 });
      await startGameplay(page);

      // Complete a turn
      for (let i = 0; i < 5; i++) {
        await page.getByTestId('button-correct').click();
      }

      // Navigate to scoreboard
      await page.getByTestId('turn-summary-view-scoreboard').click();
      await expect(page.getByTestId('scoreboard')).toBeVisible();

      // Verify scoreboard text is visible (not white)
      const scoreboardTitle = page.locator('text=Scoreboard');
      await expect(scoreboardTitle).toBeVisible();

      // Check that score entries are visible
      const scoreRow = page.getByTestId(/scoreboard-row-/).first();
      await expect(scoreRow).toBeVisible();

      // Verify score values are readable
      const scores = page.getByTestId(/scoreboard-score-/);
      const firstScore = scores.first();
      await expect(firstScore).toBeVisible();

      // Check text color is not white (verify readability)
      const scoreText = await firstScore.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Color should be a dark color, not white (rgb(255, 255, 255))
      expect(scoreText).not.toBe('rgb(255, 255, 255)');
    });
  });
});
