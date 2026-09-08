'use client';

import { useSyncExternalStore } from 'react';

export const COOKIE_CONSENT_STORAGE_KEY = 'fp_cookie_consent';

export type CookieConsentChoice = 'accepted' | 'declined';

const listeners = new Set<() => void>();

const isChoice = (value: string | null): value is CookieConsentChoice => {
  return value === 'accepted' || value === 'declined';
};

const notifyCookieConsentListeners = () => {
  listeners.forEach((listener) => listener());
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
  notifyCookieConsentListeners();
};

export const subscribeCookieConsent = (listener: () => void): (() => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
};

export const useCookieConsent = (): CookieConsentChoice | null | undefined => {
  return useSyncExternalStore(subscribeCookieConsent, readCookieConsent, () => undefined);
};
