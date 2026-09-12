export const GOOGLE_ADS_ID = 'AW-16463260124';

export const GOOGLE_ADS_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;

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

export const initGoogleAds = (options?: { loadRemoteScript?: boolean }): void => {
  if (typeof window === 'undefined') return;
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
  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ADS_ID);

  if (!shouldLoadRemoteScript(options?.loadRemoteScript)) return;
  if (document.querySelector(`script[src="${GOOGLE_ADS_SCRIPT_SRC}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = GOOGLE_ADS_SCRIPT_SRC;
  document.head.appendChild(script);
};

export const applyGoogleAdsConsent = (choice: 'accepted' | 'declined' | null): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('consent', 'update', consentForChoice(choice));
};
