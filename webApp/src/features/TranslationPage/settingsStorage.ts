import { NativeLangCode } from '@/libs/language/type';
import {
  DEFAULT_TRANSLATION_PAGE_SETTINGS,
  MAX_TRANSLATION_LANGUAGES,
  MIN_TRANSLATION_LANGUAGES,
  TRANSLATION_PAGE_SETTINGS_KEY,
} from './constants';
import { isNativeLangCode } from './isNativeLangCode';
import { TranslationPageSettings } from './types';

const uniqueLanguages = (languages: NativeLangCode[]): NativeLangCode[] => {
  return [...new Set(languages)];
};

export const normalizeTranslationPageSettings = (
  value: Partial<TranslationPageSettings> | null | undefined,
): TranslationPageSettings => {
  const languages = uniqueLanguages(
    (value?.languages || []).filter((language): language is NativeLangCode =>
      isNativeLangCode(language),
    ),
  ).slice(0, MAX_TRANSLATION_LANGUAGES);

  return {
    languages:
      languages.length >= MIN_TRANSLATION_LANGUAGES
        ? languages
        : DEFAULT_TRANSLATION_PAGE_SETTINGS.languages,
    voiceOverEnabled:
      typeof value?.voiceOverEnabled === 'boolean'
        ? value.voiceOverEnabled
        : DEFAULT_TRANSLATION_PAGE_SETTINGS.voiceOverEnabled,
    autoPronounceSource:
      typeof value?.autoPronounceSource === 'boolean'
        ? value.autoPronounceSource
        : DEFAULT_TRANSLATION_PAGE_SETTINGS.autoPronounceSource,
    autoPronounceResult:
      typeof value?.autoPronounceResult === 'boolean'
        ? value.autoPronounceResult
        : DEFAULT_TRANSLATION_PAGE_SETTINGS.autoPronounceResult,
  };
};

export const readTranslationPageSettings = (): TranslationPageSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_TRANSLATION_PAGE_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(TRANSLATION_PAGE_SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_TRANSLATION_PAGE_SETTINGS;
    }
    return normalizeTranslationPageSettings(JSON.parse(raw) as Partial<TranslationPageSettings>);
  } catch {
    return DEFAULT_TRANSLATION_PAGE_SETTINGS;
  }
};

export const writeTranslationPageSettings = (settings: TranslationPageSettings): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      TRANSLATION_PAGE_SETTINGS_KEY,
      JSON.stringify(normalizeTranslationPageSettings(settings)),
    );
  } catch {
    // Ignore quota / disabled storage.
  }
};
