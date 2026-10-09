/**
 * @jest-environment jsdom
 */

import { COOKIE_CONSENT_STORAGE_KEY, writeCookieConsent } from './cookieConsent';
import {
  acceptCookies,
  ADS_ID,
  adsDestinationConfig,
  DENIED_CONSENT,
  GA4_ID,
  GOOGLE_TAG_SRC,
  GRANTED_CONSENT,
  initGTag,
  restoreAdClickOnPage,
} from './initGTag';

jest.mock('./isDev', () => ({
  isDev: jest.fn(() => false),
}));

const dataLayerCalls = () =>
  (window.dataLayer || []).map((entry) => Array.from(entry as ArrayLike<unknown>));

describe('initGTag', () => {
  beforeEach(() => {
    delete window.gtag;
    delete window.dataLayer;
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie = 'fp_ad_click=; Path=/; Max-Age=0';
  });

  it('queues denied consent before GA4 and Google Ads config, then loads one tag', () => {
    initGTag();

    expect(typeof window.gtag).toBe('function');
    const calls = dataLayerCalls();
    const consentIndex = calls.findIndex((call) => call[0] === 'consent' && call[1] === 'default');
    const gaIndex = calls.findIndex((call) => call[0] === 'config' && call[1] === GA4_ID);
    const adsIndex = calls.findIndex((call) => call[0] === 'config' && call[1] === ADS_ID);

    expect(calls[consentIndex]).toEqual([
      'consent',
      'default',
      expect.objectContaining({ ...DENIED_CONSENT, wait_for_update: 500 }),
    ]);
    expect(consentIndex).toBeLessThan(gaIndex);
    expect(gaIndex).toBeLessThan(adsIndex);

    const scripts = document.querySelectorAll(`script[src="${GOOGLE_TAG_SRC}"]`);
    expect(scripts).toHaveLength(1);
    expect((scripts[0] as HTMLScriptElement).async).toBe(true);
  });

  it('does not install a second tag or send a second config', () => {
    initGTag();
    initGTag();

    expect(document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')).toHaveLength(
      1,
    );
    const configs = dataLayerCalls().filter((call) => call[0] === 'config');
    expect(configs).toEqual([
      ['config', GA4_ID],
      ['config', ADS_ID],
    ]);
  });

  it('keeps the ad click id in the url until consent', () => {
    initGTag();

    expect(dataLayerCalls()).toEqual(expect.arrayContaining([['set', 'url_passthrough', true]]));
  });

  it('shares the ads cookie domain on fluencypal hosts', () => {
    expect(adsDestinationConfig('app.fluencypal.com')).toEqual({
      cookie_domain: 'fluencypal.com',
    });
    expect(adsDestinationConfig('localhost')).toBeUndefined();
  });

  it('restores a click id saved on the marketing site', () => {
    document.cookie = `fp_ad_click=${encodeURIComponent(JSON.stringify({ gclid: 'from-www' }))}`;
    window.history.replaceState({}, '', '/practice');

    restoreAdClickOnPage();

    expect(window.location.search).toContain('gclid=from-www');
  });

  it('restores the ad click id before granting consent', () => {
    window.sessionStorage.setItem('fp_ad_click', JSON.stringify({ gclid: 'click-1' }));
    window.history.replaceState({}, '', '/practice');

    acceptCookies();

    expect(window.location.search).toContain('gclid=click-1');
    const calls = dataLayerCalls();
    const updateIndex = calls.findIndex((call) => call[0] === 'consent' && call[1] === 'update');
    expect(updateIndex).toBeGreaterThan(-1);
    expect(window.location.search).toContain('gclid=click-1');
  });

  it('grants analytics and ads cookies after Google or email sign-in', () => {
    acceptCookies();

    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).toBe('accepted');
    expect(dataLayerCalls()).toEqual(
      expect.arrayContaining([['consent', 'update', GRANTED_CONSENT]]),
    );
  });

  it('applies a stored acceptance before the tag config', () => {
    writeCookieConsent('accepted');
    initGTag();

    const calls = dataLayerCalls();
    const updateIndex = calls.findIndex((call) => call[0] === 'consent' && call[1] === 'update');
    const gaIndex = calls.findIndex((call) => call[0] === 'config' && call[1] === GA4_ID);

    expect(calls[updateIndex]?.[2]).toEqual(GRANTED_CONSENT);
    expect(updateIndex).toBeGreaterThan(-1);
    expect(updateIndex).toBeLessThan(gaIndex);
  });
});
