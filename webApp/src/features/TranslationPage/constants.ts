import { NativeLangCode } from '@/libs/language/type';
import { TranslationPageSettings } from './types';

export const TRANSLATION_PAGE_SETTINGS_KEY = 'translation-page-settings-v1';
export const TRANSLATION_DEBOUNCE_MS = 400;
export const MIN_TRANSLATION_LANGUAGES = 2;
export const MAX_TRANSLATION_LANGUAGES = 6;

export const DEFAULT_TRANSLATION_LANGUAGES: NativeLangCode[] = ['ru', 'pl', 'en'];

export const DEFAULT_TRANSLATION_PAGE_SETTINGS: TranslationPageSettings = {
  languages: DEFAULT_TRANSLATION_LANGUAGES,
  voiceOverEnabled: true,
  autoPronounceSource: true,
  autoPronounceResult: true,
};
