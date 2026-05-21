import { expect, Page } from '@playwright/test';

const READER_SETTINGS_STORAGE_KEY = 'reader-browser-speech-settings';

export const waitForReaderSettingPersisted = async (
  page: Page,
  property: string,
  expectedValue: unknown,
) => {
  await expect
    .poll(async () =>
      page.evaluate(
        ({ key, property, expectedValue }) => {
          const raw = localStorage.getItem(key);
          if (!raw) {
            return false;
          }

          try {
            const settings = JSON.parse(raw) as Record<string, unknown>;
            return settings[property] === expectedValue;
          } catch {
            return false;
          }
        },
        { key: READER_SETTINGS_STORAGE_KEY, property, expectedValue },
      ),
    )
    .toBe(true);
};

export const waitForReaderStringSetting = async (page: Page, property: string) => {
  await expect
    .poll(async () =>
      page.evaluate(
        ({ key, property }) => {
          const raw = localStorage.getItem(key);
          if (!raw) {
            return false;
          }

          try {
            const settings = JSON.parse(raw) as Record<string, unknown>;
            return typeof settings[property] === 'string' && settings[property] !== '';
          } catch {
            return false;
          }
        },
        { key: READER_SETTINGS_STORAGE_KEY, property },
      ),
    )
    .toBe(true);
};

export const openSettingsPopover = async (page: Page) => {
  await page.getByRole('button', { name: 'Book info' }).click();
  await page.getByTestId('book-info-tab-settings').click();
  await expect(
    page.locator('.MuiPopover-paper').getByText('Settings', { exact: true }),
  ).toBeVisible();
};

export const closeSettingsPopover = async (page: Page) => {
  const selectMenu = page.locator('div[id^="menu-"][role="presentation"]');
  if (await selectMenu.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await expect(selectMenu).not.toBeVisible();
  }

  const popover = page.locator('.MuiPopover-paper');
  const isSettingsVisible = await popover.isVisible().catch(() => false);
  if (isSettingsVisible) {
    const popoverCloseButton = popover.getByRole('button', { name: 'Close settings' });

    await popoverCloseButton.click({ force: true }).catch(async () => {
      await page.mouse.click(900, 500);
    });
  }

  await expect(popover).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();
};

export const selectRussianTranslateTarget = async (page: Page) => {
  await page.getByLabel('Translate to').click();
  await page.getByRole('option', { name: 'Russian' }).click();
  await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
};

export const enableTranslateOnHover = async (page: Page) => {
  const translateOnHover = page.getByRole('checkbox', { name: 'Translate on Hover' });
  await expect(translateOnHover).toBeVisible();
  await translateOnHover.check();
  await waitForReaderSettingPersisted(page, 'translateOnHover', true);
};

export const enableVoiceOverSelectedText = async (page: Page) => {
  const voiceOver = page.getByRole('checkbox', { name: 'Voice Over Selected Text' });
  await expect(voiceOver).toBeVisible();
  await voiceOver.check();
  await waitForReaderSettingPersisted(page, 'voiceOverSelectedText', true);
};
