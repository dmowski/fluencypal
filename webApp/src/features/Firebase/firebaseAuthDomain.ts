/** Firebase Hosting origin that serves `/__/auth/*` today. */
export const FIREBASE_PROJECT_AUTH_DOMAIN = 'dark-lang.firebaseapp.com';

/**
 * Hosts where this Next app proxies `/__/auth` and `/__/firebase` onto the
 * project origin. Sign-in must use that same host: iOS Safari drops the
 * redirect result when it is stored on firebaseapp.com.
 *
 * Google Cloud still needs this redirect URI on the Firebase web client:
 * `https://app.fluencypal.com/__/auth/handler`
 */
const SAME_ORIGIN_AUTH_HOSTS = new Set(['app.fluencypal.com']);

export const resolveFirebaseAuthDomain = (hostname?: string): string => {
  const host = hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  if (SAME_ORIGIN_AUTH_HOSTS.has(host)) {
    return host;
  }
  return FIREBASE_PROJECT_AUTH_DOMAIN;
};
