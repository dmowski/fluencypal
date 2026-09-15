/** @jest-environment jsdom */

import {
  buildUserSource,
  captureUserSourceFromTrackerSearch,
  formatUserSourceLabel,
  getParamsFromStorage,
  persistUserSourceIfAbsent,
  SOURCE_STORAGE_KEY,
} from './userSourceCapture';

describe('userSourceCapture', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('builds landing page path and utm fields from a marketing URL', () => {
    expect(
      buildUserSource(
        'https://www.fluencypal.com/es?utm_source=google&utm_medium=cpc&utm_campaign=brand&fpv=fpv_1',
        'https://www.google.com/',
      ),
    ).toEqual({
      urlPath: '/es?utm_source=google&utm_medium=cpc&utm_campaign=brand',
      referrer: 'https://www.google.com/',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'brand',
      utmTerm: null,
      utmContent: null,
      gclid: null,
      gbraid: null,
      wbraid: null,
    });
  });

  it('ignores the analytics tracker iframe path', () => {
    expect(buildUserSource('https://app.fluencypal.com/analytics/tracker', '')).toBeNull();
  });

  it('reads the parent landing URL from the tracker query', () => {
    const search =
      '?fp_src=' +
      encodeURIComponent('https://www.fluencypal.com/pt?utm_source=chatgpt.com') +
      '&fp_ref=' +
      encodeURIComponent('https://chatgpt.com/');

    expect(captureUserSourceFromTrackerSearch(search)).toEqual({
      urlPath: '/pt?utm_source=chatgpt.com',
      referrer: 'https://chatgpt.com/',
      utmSource: 'chatgpt.com',
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      gclid: null,
      gbraid: null,
      wbraid: null,
    });
  });

  it('treats a stored tracker path as missing so a real page can replace it', () => {
    window.localStorage.setItem(
      SOURCE_STORAGE_KEY,
      JSON.stringify({ urlPath: '/analytics/tracker', referrer: 'https://www.fluencypal.com/' }),
    );

    expect(getParamsFromStorage()).toBeNull();

    const next = persistUserSourceIfAbsent(
      buildUserSource('https://www.fluencypal.com/es?utm_source=google', 'https://www.google.com/'),
    );
    expect(next?.urlPath).toBe('/es?utm_source=google');
    expect(JSON.parse(window.localStorage.getItem(SOURCE_STORAGE_KEY) || '{}').urlPath).toBe(
      '/es?utm_source=google',
    );
  });

  it('formats landing path and utm marks for admin', () => {
    expect(
      formatUserSourceLabel({
        urlPath: '/es?utm_source=google&utm_medium=cpc',
        referrer: 'https://www.google.com/',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        gclid: null,
        gbraid: null,
        wbraid: null,
      }),
    ).toBe('/es?utm_source=google&utm_medium=cpc · ref=www.google.com');
  });

  it('uses a FluencyPal referrer when the stored path is the tracker iframe', () => {
    expect(
      formatUserSourceLabel({
        urlPath: '/analytics/tracker',
        referrer: 'https://www.fluencypal.com/es?utm_source=google&utm_medium=cpc',
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        gclid: null,
        gbraid: null,
        wbraid: null,
      }),
    ).toBe('/es?utm_source=google&utm_medium=cpc');
  });

  it('hides a tracker path with no landing or utm data', () => {
    expect(
      formatUserSourceLabel({
        urlPath: '/analytics/tracker',
        referrer: '',
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        gclid: null,
        gbraid: null,
        wbraid: null,
      }),
    ).toBeNull();
  });
});
