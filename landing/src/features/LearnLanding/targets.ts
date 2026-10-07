import {
  SupportedLanguage,
  langFlags,
  supportedLanguages,
  supportedLanguagesToLearn,
} from '@/features/Lang/lang';

/** Site languages the product does not teach. */
const notTaught = ['uk', 'da', 'no', 'sv', 'be'] as const satisfies readonly SupportedLanguage[];

/** Interface languages that have a translated site catalog. */
export const learnPageLocales = supportedLanguages;

export type LearnPageLocale = SupportedLanguage;

export type LearnTarget = Exclude<SupportedLanguage, (typeof notTaught)[number]>;

const notTaughtCodes = new Set<string>(notTaught);

export const learnTargetLanguages = supportedLanguagesToLearn.filter(
  (lang): lang is LearnTarget => {
    if (notTaughtCodes.has(lang)) {
      throw new Error(`${lang} is not a learn-page target`);
    }
    return true;
  },
);

export const isLearnPageLocale = (value: string): value is LearnPageLocale =>
  (learnPageLocales as readonly string[]).includes(value);

export const isLearnTarget = (value: string): value is LearnTarget =>
  (learnTargetLanguages as readonly string[]).includes(value);

/** `/learn/pl` in English, `/ru/learn/sr` in every other interface language. */
export const learnLandingPath = (ui: LearnPageLocale, target: LearnTarget): string => {
  const page = `learn/${target}`;
  return ui === 'en' ? `/${page}` : `/${ui}/${page}`;
};

export const learnOgPath = (ui: LearnPageLocale, target: LearnTarget): string =>
  `/og/learn/${ui}/${target}`;

const flagCountryCode = (flagUrl: string): string => {
  const countryCode = flagUrl.match(/\/([a-z]{2})\.png$/)?.[1];
  if (!countryCode) {
    throw new Error(`Flag URL has no country code: ${flagUrl}`);
  }
  return countryCode;
};

export const learnTargetFlagIso = Object.fromEntries(
  learnTargetLanguages.map((lang) => [lang, flagCountryCode(langFlags[lang])]),
) as Record<LearnTarget, string>;

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
