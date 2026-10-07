/**
 * @jest-environment jsdom
 */

import { COOKIE_CONSENT_STORAGE_KEY, readCookieConsent, writeCookieConsent } from './cookieConsent';

describe('cookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when no choice is stored', () => {
    expect(readCookieConsent()).toBeNull();
  });

  it('returns null for an invalid stored value', () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, 'maybe');
    expect(readCookieConsent()).toBeNull();
  });

  it('persists and reads an accepted choice', () => {
    writeCookieConsent('accepted');
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe('accepted');
    expect(readCookieConsent()).toBe('accepted');
  });

  it('persists and reads a declined choice', () => {
    writeCookieConsent('declined');
    expect(readCookieConsent()).toBe('declined');
  });
});
