import { expect, test } from '@playwright/test';
import {
  assertCriticizingWordWasSpoken,
  assertHighlightPopoverVisible,
  assertCurrentSelectionText,
  assertSelectionTextPersists,
  assertVoicePreviewWasPlayed,
  clickCriticizingWord,
  closeSettingsPopover,
  enableVoiceOverSelectedText,
  ensureReaderTextVisible,
  installSpeechMock,
  openSeededGatsbyBook,
  openSettingsPopover,
  selectCriticizingWordText,
} from '../libs/reader';

test('reader settings voice plays preview and clicking word plays and opens highlight popover', async ({
  page,
}) => {
  await installSpeechMock(page);
  await openSeededGatsbyBook(page);

  await openSettingsPopover(page);
  await page.getByRole('combobox', { name: 'Voice' }).click();
  await page.getByRole('option', { name: 'Mock English Voice' }).click();
  await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
  await enableVoiceOverSelectedText(page);
  await closeSettingsPopover(page);

  await assertVoicePreviewWasPlayed(page);
  await clickCriticizingWord(page);
  await assertCriticizingWordWasSpoken(page);
  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /criticizing/i);
  await assertSelectionTextPersists(page, /criticizing/i);
});

test('drag-selected text is spoken when voice over is enabled', async ({ page }) => {
  await installSpeechMock(page);
  await openSeededGatsbyBook(page);

  await openSettingsPopover(page);
  await page.getByRole('combobox', { name: 'Voice' }).click();
  await page.getByRole('option', { name: 'Mock English Voice' }).click();
  await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
  await enableVoiceOverSelectedText(page);
  await closeSettingsPopover(page);

  await selectCriticizingWordText(page);
  await assertCriticizingWordWasSpoken(page);
});

test('voice over speaks new word when clicked right after previous word selection', async ({
  page,
}) => {
  await installSpeechMock(page);
  await openSeededGatsbyBook(page);

  await openSettingsPopover(page);
  await page.getByRole('combobox', { name: 'Voice' }).click();
  await page.getByRole('option', { name: 'Mock English Voice' }).click();
  await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
  await enableVoiceOverSelectedText(page);
  await closeSettingsPopover(page);

  // Ensure both words are visible before the timed section
  await ensureReaderTextVisible(page, 'remember');

  // Get bounding box of "remember" upfront so the second click is immediate
  const rememberLocator = page
    .locator('[data-word-index]')
    .filter({ hasText: /^remember$/i })
    .first();
  const rememberBox = await rememberLocator.boundingBox();
  expect(rememberBox).not.toBeNull();

  // Click "criticizing" — sets up selection-restore observer (500 ms window).
  await clickCriticizingWord(page);

  // Immediately click "remember" with real mouse events (mousedown fires onMouseDown
  // which cancels the restore observer before selectionchange can re-apply "criticizing").
  await page.mouse.click(
    rememberBox!.x + rememberBox!.width / 2,
    rememberBox!.y + rememberBox!.height / 2,
  );

  // "remember" must have been spoken (not suppressed by the stale restore)
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const spoken = (window as typeof window & { __spokenTexts?: string[] }).__spokenTexts ?? [];
        return spoken.some((text) => /\bremember\b/i.test(text));
      }),
    )
    .toBeTruthy();
});
