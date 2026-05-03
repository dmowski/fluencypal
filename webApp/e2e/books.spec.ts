import { expect, test } from '@playwright/test';
import {
  assertCriticizingWordWasSpoken,
  assertHighlightPopoverVisible,
  assertSpaceBetweenLikeAndCriticizing,
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

test('reader renders a space between "like" and "criticizing"', async ({ page }) => {
  await openSeededGatsbyBook(page);
  await assertSpaceBetweenLikeAndCriticizing(page);
});

test('reader does not produce hydration errors on open', async ({ page }) => {
  const hydrationErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        text.includes('Hydration') ||
        text.includes('hydration') ||
        text.includes('cannot be a descendant') ||
        text.includes('did not match')
      ) {
        hydrationErrors.push(text);
      }
    }
  });

  await openSeededGatsbyBook(page);

  expect(hydrationErrors, `Hydration errors found:\n${hydrationErrors.join('\n')}`).toHaveLength(0);
});
