export const COOKIE_CONSENT_STORAGE_KEY = 'fp_cookie_consent';

export type CookieConsentChoice = 'accepted' | 'declined';

const isChoice = (value: string | null): value is CookieConsentChoice => {
  return value === 'accepted' || value === 'declined';
};

export const readCookieConsent = (): CookieConsentChoice | null => {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return isChoice(value) ? value : null;
  } catch {
    return null;
  }
};

export const writeCookieConsent = (choice: CookieConsentChoice): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
  } catch {
    return;
  }
};
