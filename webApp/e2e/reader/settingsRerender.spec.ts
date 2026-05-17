import { expect, test, type Page } from '@playwright/test';
import {
  closeSettingsPopover,
  enableTranslateOnHover,
  enableVoiceOverSelectedText,
  installSpeechMock,
  openSeededGatsbyBook,
  openSettingsPopover,
  selectRussianTranslateTarget,
} from '../libs/reader';

/**
 * Guards a perf invariant: toggling settings that do not affect layout
 * (Language, Voice, Translate To, Translate on Hover, Voice Over Selected
 * Text) must not re-render memoized `ReaderParagraph` content, because
 * re-rendering recomputes paragraph token maps and word renderings which is
 * expensive.
 *
 * The render counter is exposed on each paragraph root via the
 * `data-reader-paragraph-render-count` attribute.
 */

const readRenderCounts = async (page: Page): Promise<number[]> =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-reader-paragraph-render-count]')).map(
      (el) => Number(el.getAttribute('data-reader-paragraph-render-count') ?? 0),
    ),
  );

const selectFirstAvailableVoice = async (page: Page) => {
  const voiceSelect = page.getByRole('combobox', { name: 'Voice', exact: true });
  if (await voiceSelect.isDisabled()) return false;
  await voiceSelect.click();
  const firstOption = page.locator('div[id^="menu-"][role="presentation"] [role="option"]').first();
  if (!(await firstOption.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape');
    return false;
  }
  await firstOption.click();
  await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
  // Allow ReaderSettingsPanel debounce (350 ms) to commit the change.
  await page.waitForTimeout(400);
  return true;
};

test('toggling language/voice/translate/voice-over settings does not re-render paragraph content', async ({
  page,
}) => {
  test.setTimeout(20_000);
  await installSpeechMock(page);
  await openSeededGatsbyBook(page);

  const baseline = await readRenderCounts(page);
  expect(baseline.length).toBeGreaterThan(0);
  baseline.forEach((count) => expect(count).toBeGreaterThan(0));

  await openSettingsPopover(page);

  await enableTranslateOnHover(page);
  await selectRussianTranslateTarget(page);
  await enableVoiceOverSelectedText(page);
  await selectFirstAvailableVoice(page);

  await closeSettingsPopover(page);

  const afterToggles = await readRenderCounts(page);
  expect(afterToggles.length).toBe(baseline.length);
  // Allow a difference of 1 re-render for robustness
  afterToggles.forEach((count, index) => {
    expect(
      Math.abs(count - baseline[index]),
      `paragraph #${index} re-rendered after non-layout toggles`,
    ).toBeLessThanOrEqual(1);
  });
});
