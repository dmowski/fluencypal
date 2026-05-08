import { expect, test } from '@playwright/test';
import {
  assertHighlightPopoverVisible,
  assertTranslatedTextVisible,
  clickCriticizingWord,
  closeSettingsPopover,
  enableTranslateOnHover,
  hoverCriticizingWord,
  installSpeechMock,
  mockSingleTranslation,
  openSeededGatsbyBook,
  openSettingsPopover,
  selectRussianTranslateTarget,
} from '../books.helpers';

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
  await expect.poll(() => translationSpy.getCount()).toBeGreaterThan(0);

  await clickCriticizingWord(page);
  await assertHighlightPopoverVisible(page);
  await assertTranslatedTextVisible(page, 'критиковать');
});
