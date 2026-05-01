import { translateBatchRequest, translateRequest } from '@/app/api/translate/translateRequest';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';

const localStoragePrefix = 'translate_';
const isUseCache = true;

const normalizeTranslationKey = (text: string) => text.trim();

const isNativeLangCode = (language: string): language is NativeLangCode => {
  return Object.prototype.hasOwnProperty.call(fullLanguagesMap, language);
};

const getTranslatorCache = (
  sourceLanguage: NativeLangCode | null,
  targetLanguage: NativeLangCode | null,
): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const localStorageKey = `${localStoragePrefix}${sourceLanguage || 'auto'}-${targetLanguage || 'auto'}`;
  const cacheString = window.localStorage.getItem(localStorageKey);
  if (!cacheString) {
    return {};
  }

  try {
    return JSON.parse(cacheString) as Record<string, string>;
  } catch (error) {
    console.log('Error parsing translation cache from localStorage', error);
    return {};
  }
};

const setTranslatorCache = (
  sourceLanguage: NativeLangCode | null,
  targetLanguage: NativeLangCode | null,
  cache: Record<string, string>,
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const localStorageKey = `${localStoragePrefix}${sourceLanguage || 'auto'}-${targetLanguage || 'auto'}`;
  try {
    window.localStorage.setItem(localStorageKey, JSON.stringify(cache));
  } catch (error) {
    console.log('Error saving translation cache to localStorage', error);
  }
};

export const resolveTranslateTargetLanguage = ({
  nativeLanguageCode,
  pageLangCode,
  learningLanguage,
}: {
  nativeLanguageCode: string | null;
  pageLangCode: string | null;
  learningLanguage: string | null;
}): NativeLangCode | null => {
  const targetCandidates = [nativeLanguageCode, pageLangCode].filter(Boolean);

  const candidate = targetCandidates.find(
    (language): language is NativeLangCode =>
      typeof language === 'string' && language !== learningLanguage && isNativeLangCode(language),
  );

  return candidate ?? null;
};

export const normalizeToNativeLangCode = (
  language: string | null | undefined,
): NativeLangCode | null => {
  if (!language) {
    return null;
  }

  if (isNativeLangCode(language)) {
    return language;
  }

  const baseLanguage = language.split('-')[0];
  return isNativeLangCode(baseLanguage) ? baseLanguage : null;
};

export const getTranslation = async ({
  text,
  sourceLanguage,
  targetLanguage,
}: {
  text: string;
  sourceLanguage?: NativeLangCode | null;
  targetLanguage?: NativeLangCode | null;
}): Promise<string> => {
  if (!targetLanguage) {
    return '';
  }

  const normalizedText = normalizeTranslationKey(text);
  if (!normalizedText) {
    return '';
  }

  let cache = isUseCache ? getTranslatorCache(sourceLanguage || null, targetLanguage) : {};
  if (cache[normalizedText]) {
    return cache[normalizedText];
  }

  const response = await translateRequest({
    text: normalizedText,
    sourceLanguage: sourceLanguage || null,
    targetLanguage,
  });

  if (isUseCache) {
    cache = getTranslatorCache(sourceLanguage || null, targetLanguage);
    cache[normalizedText] = response.translatedText;
    setTranslatorCache(sourceLanguage || null, targetLanguage, cache);
  }

  return response.translatedText;
};

export const getBatchTranslation = async ({
  texts,
  sourceLanguage,
  targetLanguage,
}: {
  texts: string[];
  sourceLanguage?: NativeLangCode | null;
  targetLanguage?: NativeLangCode | null;
}): Promise<string[]> => {
  if (!targetLanguage) {
    return [];
  }

  const response = await translateBatchRequest({
    texts,
    sourceLanguage: sourceLanguage || null,
    targetLanguage,
  });

  return response.translatedTexts;
};
