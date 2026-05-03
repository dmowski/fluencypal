import { expect, Page } from '@playwright/test';

export const openSettingsPopover = async (page: Page) => {
  await page.getByRole('button', { name: 'Reader settings' }).click();
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
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();
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
};

export const enableVoiceOverSelectedText = async (page: Page) => {
  const voiceOver = page.getByRole('checkbox', { name: 'Voice Over Selected Text' });
  await expect(voiceOver).toBeVisible();
  await voiceOver.check();
};
