import { SupportedLanguage, supportedLanguagesToLearn } from '@/features/Lang/lang';

/** A missing code, or one people cannot learn here, is English. */
export function fluencyCallLanguageCode(code: string | null | undefined): SupportedLanguage {
  return supportedLanguagesToLearn.find((lang) => lang === code) || 'en';
}

export function fluencyCallLanguageOptions(): SupportedLanguage[] {
  return supportedLanguagesToLearn;
}
