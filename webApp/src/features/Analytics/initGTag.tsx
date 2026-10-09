'use client';

import { browserClickIds, persistBrowserAdClick, urlWithClickIds } from './adClickParams';
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
/**
 * Submit lead form, fired when Stripe checkout starts.
 * Page view is AW-16463260124/wRIsCLS2o7kaENzTpao9 and must not be sent here.
 */
export const CHECKOUT_CONVERSION_LABEL = 'a8vxCK7hpPUaENzTpao9';
export const CHECKOUT_CONVERSION = `${ADS_ID}/${CHECKOUT_CONVERSION_LABEL}`;
export const GOOGLE_TAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;

export const GOOGLE_ADS_LINKER = {
  domains: ['fluencypal.com', 'www.fluencypal.com', 'app.fluencypal.com'],
  accept_incoming: true,
} as const;

/** Share the Google click cookie across www and app once consent is granted. */
export const adsDestinationConfig = (
  hostname: string,
  options?: { sendPageView?: boolean },
): { cookie_domain?: string; send_page_view?: boolean } | undefined => {
  const config: { cookie_domain?: string; send_page_view?: boolean } = {};
  if (hostname === 'fluencypal.com' || hostname.endsWith('.fluencypal.com')) {
    config.cookie_domain = 'fluencypal.com';
  }
  if (options?.sendPageView === false) config.send_page_view = false;
  return Object.keys(config).length > 0 ? config : undefined;
};

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
  // Keep gclid in the URL while consent is denied, including ads that open the app directly.
  window.gtag('set', 'url_passthrough', true);
  window.gtag('set', 'linker', GOOGLE_ADS_LINKER);
  restoreAdClickOnPage();
  if (readCookieConsent() === 'accepted') {
    window.gtag('consent', 'update', GRANTED_CONSENT);
  }
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);
  const adsConfig = adsDestinationConfig(window.location.hostname);
  if (adsConfig) window.gtag('config', ADS_ID, adsConfig);
  else window.gtag('config', ADS_ID);
};

const ensureGoogleTagScript = () => {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = GOOGLE_TAG_SRC;
  document.head.appendChild(script);
};

/** Put a click id back on this page after navigation or a new tab dropped it. */
export const restoreAdClickOnPage = (): void => {
  if (typeof window === 'undefined') return;
  const next = urlWithClickIds(window.location.href, browserClickIds());
  if (!next) return;
  const url = new URL(next);
  const target = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (target === current) return;
  window.history.replaceState(window.history.state, '', target);
};

/**
 * Ask the already-loaded Ads tag to store the click id now on the URL.
 * send_page_view is off so this does not count another page-view conversion.
 */
export const bindAdsClickId = (): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  restoreAdClickOnPage();
  const config = adsDestinationConfig(window.location.hostname, { sendPageView: false }) ?? {
    send_page_view: false,
  };
  window.gtag('config', ADS_ID, config);
};

export const initGTag = () => {
  if (typeof window === 'undefined') return;
  persistBrowserAdClick();
  restoreAdClickOnPage();
  if (!window.gtag) installGtagStub();
  else if (readCookieConsent() === 'accepted') {
    window.gtag('consent', 'update', GRANTED_CONSENT);
    bindAdsClickId();
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
  bindAdsClickId();
};
