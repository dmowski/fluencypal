import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';

export const PENDING_PRACTICE_LANGUAGE_KEY = 'pendingPracticeLanguage';

export const isSupportedLearnLanguage = (value: string | null): value is SupportedLanguage =>
  Boolean(value && (supportedLanguages as readonly string[]).includes(value));

export const readPendingPracticeLanguage = (): SupportedLanguage | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(PENDING_PRACTICE_LANGUAGE_KEY);
  return isSupportedLearnLanguage(stored) ? stored : null;
};

export const writePendingPracticeLanguage = (language: SupportedLanguage) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_PRACTICE_LANGUAGE_KEY, language);
};

export const clearPendingPracticeLanguage = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_PRACTICE_LANGUAGE_KEY);
};
