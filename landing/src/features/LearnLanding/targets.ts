import { SupportedLanguage, supportedLanguagesToLearn } from '@/features/Lang/lang';

/** Interface languages that have a translated site catalog. */
export const learnPageLocales = [
  'en',
  'ru',
  'es',
  'de',
  'pl',
  'uk',
  'fr',
  'ar',
  'id',
  'it',
  'ja',
  'ko',
  'ms',
  'pt',
  'th',
  'tr',
  'vi',
  'zh',
  'da',
  'no',
  'sv',
  'be',
] as const satisfies readonly SupportedLanguage[];

export type LearnPageLocale = (typeof learnPageLocales)[number];

/** Languages a visitor can study. Kept in lockstep with `supportedLanguagesToLearn`. */
export const learnTargetLanguages = [
  'en',
  'es',
  'zh',
  'fr',
  'de',
  'ja',
  'ko',
  'ar',
  'pt',
  'it',
  'pl',
  'ru',
  'id',
  'ms',
  'th',
  'tr',
  'vi',
  'sr',
] as const satisfies readonly SupportedLanguage[];

export type LearnTarget = (typeof learnTargetLanguages)[number];

export const isLearnPageLocale = (value: string): value is LearnPageLocale =>
  (learnPageLocales as readonly string[]).includes(value);

export const isLearnTarget = (value: string): value is LearnTarget =>
  (learnTargetLanguages as readonly string[]).includes(value);

export const learnTargetsMatchCatalog = (): boolean => {
  const catalog = [...supportedLanguagesToLearn].sort();
  const pages = [...learnTargetLanguages].sort();
  return catalog.length === pages.length && catalog.every((code, index) => code === pages[index]);
};

/** `/learn/pl` in English, `/ru/learn/sr` in every other interface language. */
export const learnLandingPath = (ui: LearnPageLocale, target: LearnTarget): string => {
  const page = `learn/${target}`;
  return ui === 'en' ? `/${page}` : `/${ui}/${page}`;
};

export const learnOgPath = (ui: LearnPageLocale, target: LearnTarget): string =>
  `/og/learn/${ui}/${target}`;

export const learnTargetFlagIso: Record<LearnTarget, string> = {
  en: 'us',
  es: 'es',
  zh: 'cn',
  fr: 'fr',
  de: 'de',
  ja: 'jp',
  ko: 'kr',
  ar: 'sa',
  pt: 'pt',
  it: 'it',
  pl: 'pl',
  ru: 'ru',
  id: 'id',
  ms: 'my',
  th: 'th',
  tr: 'tr',
  vi: 'vn',
  sr: 'rs',
};

/** Saturated accent for the share image, close to each flag. */
export const learnTargetAccent: Record<LearnTarget, string> = {
  en: '#2563eb',
  es: '#d97706',
  zh: '#dc2626',
  fr: '#3730a3',
  de: '#ca8a04',
  ja: '#be185d',
  ko: '#6d28d9',
  ar: '#047857',
  pt: '#15803d',
  it: '#0f766e',
  pl: '#e11d48',
  ru: '#1d4ed8',
  id: '#ea580c',
  ms: '#0369a1',
  th: '#7e22ce',
  tr: '#be123c',
  vi: '#e11d48',
  sr: '#c8102e',
};
