import { persistBrowserAdClick, browserClickIds, urlWithClickIds } from './adClickParams';

export const GOOGLE_ADS_ID = 'AW-16463260124';

export const GOOGLE_ADS_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;

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

export type GoogleAdsConsentState = typeof DENIED_CONSENT | typeof GRANTED_CONSENT;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const consentForChoice = (choice: 'accepted' | 'declined' | null): GoogleAdsConsentState => {
  return choice === 'accepted' ? GRANTED_CONSENT : DENIED_CONSENT;
};

const shouldLoadRemoteScript = (loadRemoteScript?: boolean): boolean => {
  if (typeof loadRemoteScript === 'boolean') return loadRemoteScript;
  return process.env.NODE_ENV === 'production';
};

/** Put a click id back on this page after navigation dropped it. */
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
export const bindGoogleAdsClick = (): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  restoreAdClickOnPage();
  const config = adsDestinationConfig(window.location.hostname, { sendPageView: false }) ?? {
    send_page_view: false,
  };
  window.gtag('config', GOOGLE_ADS_ID, config);
};

export const initGoogleAds = (options?: { loadRemoteScript?: boolean }): void => {
  if (typeof window === 'undefined') return;
  persistBrowserAdClick();
  restoreAdClickOnPage();
  if (window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // Google's snippet pushes the Arguments object, not a rest-parameter array.
    window.dataLayer!.push(arguments);
  };

  window.gtag('consent', 'default', {
    ...DENIED_CONSENT,
    wait_for_update: 500,
  });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'url_passthrough', true);
  window.gtag('set', 'linker', GOOGLE_ADS_LINKER);
  window.gtag('js', new Date());
  const adsConfig = adsDestinationConfig(window.location.hostname);
  if (adsConfig) window.gtag('config', GOOGLE_ADS_ID, adsConfig);
  else window.gtag('config', GOOGLE_ADS_ID);

  if (!shouldLoadRemoteScript(options?.loadRemoteScript)) return;
  if (document.querySelector(`script[src="${GOOGLE_ADS_SCRIPT_SRC}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = GOOGLE_ADS_SCRIPT_SRC;
  document.head.appendChild(script);
};

export const applyGoogleAdsConsent = (choice: 'accepted' | 'declined' | null): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  restoreAdClickOnPage();
  window.gtag('consent', 'update', consentForChoice(choice));
  if (choice === 'accepted') bindGoogleAdsClick();
};
