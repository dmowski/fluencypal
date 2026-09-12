/**
 * @jest-environment jsdom
 */

import {
  applyGoogleAdsConsent,
  consentForChoice,
  DENIED_CONSENT,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_SCRIPT_SRC,
  GRANTED_CONSENT,
  initGoogleAds,
} from './googleAds';

const dataLayerCalls = () =>
  (window.dataLayer || []).map((entry) => Array.from(entry as IArguments));

describe('googleAds', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.gtag;
    delete window.dataLayer;
    document.head.innerHTML = '';
  });

  it('maps accept to granted ads and analytics consent', () => {
    expect(consentForChoice('accepted')).toEqual(GRANTED_CONSENT);
  });

  it('keeps ads and analytics denied until the user accepts', () => {
    expect(consentForChoice(null)).toEqual(DENIED_CONSENT);
    expect(consentForChoice('declined')).toEqual(DENIED_CONSENT);
  });

  it('bootstraps gtag with Consent Mode denied and the Ads config', () => {
    initGoogleAds({ loadRemoteScript: false });

    expect(typeof window.gtag).toBe('function');
    expect(dataLayerCalls()).toEqual(
      expect.arrayContaining([
        [
          'consent',
          'default',
          expect.objectContaining({
            ...DENIED_CONSENT,
            wait_for_update: 500,
          }),
        ],
        ['config', GOOGLE_ADS_ID],
      ]),
    );
    expect(document.querySelector(`script[src="${GOOGLE_ADS_SCRIPT_SRC}"]`)).toBeNull();
  });

  it('loads the Google tag script only when asked', () => {
    initGoogleAds({ loadRemoteScript: true });

    const script = document.querySelector(`script[src="${GOOGLE_ADS_SCRIPT_SRC}"]`);
    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect((script as HTMLScriptElement).async).toBe(true);
  });

  it('does not initialize twice', () => {
    initGoogleAds({ loadRemoteScript: true });
    initGoogleAds({ loadRemoteScript: true });

    expect(document.querySelectorAll(`script[src="${GOOGLE_ADS_SCRIPT_SRC}"]`)).toHaveLength(1);
  });

  it('updates Consent Mode when the banner choice changes', () => {
    initGoogleAds({ loadRemoteScript: false });

    applyGoogleAdsConsent('accepted');
    applyGoogleAdsConsent('declined');

    expect(dataLayerCalls()).toEqual(
      expect.arrayContaining([
        ['consent', 'update', GRANTED_CONSENT],
        ['consent', 'update', DENIED_CONSENT],
      ]),
    );
  });
});
