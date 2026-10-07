'use client';

import { readCookieConsent, writeCookieConsent } from './cookieConsent';
import { isDev } from './isDev';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA4_ID = 'G-K2X9LZJ50W';
export const ADS_ID = 'AW-16463260124';
/** Label from the existing "Submit lead form" conversion action. Not the numeric action id. */
export const CHECKOUT_CONVERSION_LABEL = 'wRIsCLS2o7kaENzTpao9';
export const CHECKOUT_CONVERSION = `${ADS_ID}/${CHECKOUT_CONVERSION_LABEL}`;
export const GOOGLE_TAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;

export const DENIED_CONSENT = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const;

export const GRANTED_CONSENT = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
} as const;

const installGtagStub = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the Arguments object used by Google's standard snippet.
    window.dataLayer!.push(arguments);
  };
  // Queue consent before config and before the remote script can execute.
  window.gtag('consent', 'default', { ...DENIED_CONSENT, wait_for_update: 500 });
  window.gtag('set', 'ads_data_redaction', true);
  // Landing keeps passthrough for ad clicks before consent. In-app links stay clean.
  window.gtag('set', 'url_passthrough', false);
  if (readCookieConsent() === 'accepted') {
    window.gtag('consent', 'update', GRANTED_CONSENT);
  }
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);
  window.gtag('config', ADS_ID);
};

const ensureGoogleTagScript = () => {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = GOOGLE_TAG_SRC;
  document.head.appendChild(script);
};

export const initGTag = () => {
  if (typeof window === 'undefined') return;
  if (!window.gtag) installGtagStub();
  else if (readCookieConsent() === 'accepted') {
    window.gtag('consent', 'update', GRANTED_CONSENT);
  }
  ensureGoogleTagScript();
};

/** Google or email sign-in. The cookie notice is on the landing page, before login. */
export const acceptCookies = () => {
  if (typeof window === 'undefined' || isDev()) return;
  writeCookieConsent('accepted');
  initGTag();
  if (!window.gtag) return;
  window.gtag('consent', 'update', GRANTED_CONSENT);
};
