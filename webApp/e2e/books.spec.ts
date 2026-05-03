import { expect, test } from '@playwright/test';
import {
  assertCriticizingWordWasSpoken,
  assertHighlightPopoverVisible,
  assertTranslatedTextVisible,
  assertVoicePreviewWasPlayed,
  assertWordHoverHasEffect,
  clickCriticizingWord,
  closeSettingsPopover,
  enableTranslateOnHover,
  hoverCriticizingWord,
  installSpeechMock,
  mockSingleTranslation,
  openSeededGatsbyBook,
  openSettingsPopover,
  selectRussianTranslateTarget,
} from './books.helpers';

test('reader shows criticizing word and hover effect', async ({ page }) => {
  await openSeededGatsbyBook(page);
  await assertWordHoverHasEffect(page);
});

test('reader settings voice plays preview and clicking word plays and opens highlight popover', async ({
  page,
}) => {
  await installSpeechMock(page);
  await openSeededGatsbyBook(page);

  await openSettingsPopover(page);
  await page.getByLabel('Voice').click();
  await page.getByRole('option', { name: 'Mock English Voice' }).click();
  await closeSettingsPopover(page);

  await assertVoicePreviewWasPlayed(page);
  await clickCriticizingWord(page);
  await assertCriticizingWordWasSpoken(page);
  await assertHighlightPopoverVisible(page);
});

test('translate on hover sends one request and shows tooltip; click shows popover with translated text', async ({
  page,
}) => {
  await installSpeechMock(page);

  const translationSpy = await mockSingleTranslation(page, 'критиковать');

  await openSeededGatsbyBook(page);
  await openSettingsPopover(page);
  await enableTranslateOnHover(page);
  await selectRussianTranslateTarget(page);
  await closeSettingsPopover(page);

  await hoverCriticizingWord(page);

  await assertTranslatedTextVisible(page, 'критиковать');
  await expect.poll(() => translationSpy.getCount()).toBe(1);

  await clickCriticizingWord(page);
  await assertHighlightPopoverVisible(page);
  await assertTranslatedTextVisible(page, 'критиковать');
});
