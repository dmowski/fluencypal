import { DEFAULT_TRANSLATION_PAGE_SETTINGS } from './constants';
import { normalizeTranslationPageSettings } from './settingsStorage';

describe('normalizeTranslationPageSettings', () => {
  it('falls back to defaults for empty or invalid values', () => {
    expect(normalizeTranslationPageSettings(null)).toEqual(DEFAULT_TRANSLATION_PAGE_SETTINGS);
    expect(normalizeTranslationPageSettings({})).toEqual(DEFAULT_TRANSLATION_PAGE_SETTINGS);
    expect(normalizeTranslationPageSettings({ languages: ['xx'] as never })).toEqual(
      DEFAULT_TRANSLATION_PAGE_SETTINGS,
    );
  });

  it('keeps valid languages and voice flags', () => {
    expect(
      normalizeTranslationPageSettings({
        languages: ['en', 'pl', 'en', 'ru'],
        voiceOverEnabled: false,
        autoPronounceSource: false,
        autoPronounceResult: true,
      }),
    ).toEqual({
      languages: ['en', 'pl', 'ru'],
      voiceOverEnabled: false,
      autoPronounceSource: false,
      autoPronounceResult: true,
    });
  });
});
