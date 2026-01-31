import { expect, Page } from '@playwright/test';

export async function navigateToModeSelection(page: Page) {
  await page.goto('/alias');
  const htmlLang = await page.locator('html').getAttribute('lang');
  expect(htmlLang).toBe('en');
  await expect(page.getByTestId('mode-free-for-all')).toBeVisible();
}

export async function selectGameMode(page: Page, mode: 'free-for-all' | 'teams') {
  await page.getByTestId(`mode-${mode}`).click();
  await expect(page.getByTestId('players-setup')).toBeVisible();
}

export async function setupPlayers(page: Page, addPlayers = 0) {
  for (let i = 0; i < addPlayers; i++) {
    await page.getByTestId('add-player').click();
  }
  await page.getByTestId('players-continue').click();
  await expect(page.getByTestId('language-level')).toBeVisible();
}

export async function selectLanguageLevel(page: Page, level: 'simple' | 'advanced' = 'simple') {
  const button = page.getByTestId(`language-${level}`);
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('language-continue').click();
  await expect(page.getByTestId('category-selection')).toBeVisible();
}

export async function selectCategories(page: Page, selectAll = true) {
  if (selectAll) {
    await page.getByTestId('categories-select-all').click();
  }
  await expect(page.getByTestId('categories-continue')).toBeEnabled();
  await page.getByTestId('categories-continue').click();
  await expect(page.getByTestId('round-settings')).toBeVisible();
}

export async function configureRoundSettings(
  page: Page,
  options: { mode?: 'fixed' | 'timed'; value?: number; rounds?: number } = {},
) {
  const { mode = 'timed', value = 60, rounds = 1 } = options;

  if (mode === 'fixed') {
    await page.getByTestId('turn-type-fixed').click();
    await page.getByTestId(`word-count-${value}`).click();
  } else {
    await page.getByTestId('turn-type-timed').click();
    await page.getByTestId(`duration-${value}`).click();
  }

  if (rounds > 1) {
    await page.getByTestId(`rounds-${rounds}`).click();
  }
}

export async function startGameplay(page: Page) {
  await page.getByTestId('round-settings-start').click();
  await expect(page.getByTestId('turn-start')).toBeVisible();
  await page.getByTestId('turn-start-button').click();
  await expect(page.getByTestId('gameplay')).toBeVisible();
}

export async function navigateFullSetup(
  page: Page,
  mode: 'free-for-all' | 'teams' = 'free-for-all',
  roundOptions = {},
) {
  await navigateToModeSelection(page);
  await selectGameMode(page, mode);
  await setupPlayers(page);
  await selectLanguageLevel(page);
  await selectCategories(page);
  await configureRoundSettings(page, roundOptions);
}
