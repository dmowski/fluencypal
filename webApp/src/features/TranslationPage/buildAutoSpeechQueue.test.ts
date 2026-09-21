import { buildAutoSpeechQueue } from './buildAutoSpeechQueue';
import { DEFAULT_TRANSLATION_PAGE_SETTINGS } from './constants';

describe('buildAutoSpeechQueue', () => {
  const texts = {
    ru: 'Привет',
    pl: 'Cześć',
    en: 'Hello',
  };

  it('returns nothing when voice over is off', () => {
    expect(
      buildAutoSpeechQueue({
        sourceLanguage: 'pl',
        texts,
        settings: { ...DEFAULT_TRANSLATION_PAGE_SETTINGS, voiceOverEnabled: false },
      }),
    ).toEqual([]);
  });

  it('speaks source then other columns in order', () => {
    expect(
      buildAutoSpeechQueue({
        sourceLanguage: 'pl',
        texts,
        settings: DEFAULT_TRANSLATION_PAGE_SETTINGS,
      }),
    ).toEqual([
      { language: 'pl', text: 'Cześć' },
      { language: 'ru', text: 'Привет' },
      { language: 'en', text: 'Hello' },
    ]);
  });

  it('can speak only source or only results', () => {
    expect(
      buildAutoSpeechQueue({
        sourceLanguage: 'en',
        texts,
        settings: {
          ...DEFAULT_TRANSLATION_PAGE_SETTINGS,
          autoPronounceSource: true,
          autoPronounceResult: false,
        },
      }),
    ).toEqual([{ language: 'en', text: 'Hello' }]);

    expect(
      buildAutoSpeechQueue({
        sourceLanguage: 'en',
        texts,
        settings: {
          ...DEFAULT_TRANSLATION_PAGE_SETTINGS,
          autoPronounceSource: false,
          autoPronounceResult: true,
        },
      }),
    ).toEqual([
      { language: 'ru', text: 'Привет' },
      { language: 'pl', text: 'Cześć' },
    ]);
  });
});
