/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, render } from '@testing-library/react';
import { writeCookieConsent } from '@/features/Legal/cookieConsent';
import { DENIED_CONSENT, GOOGLE_ADS_ID, GRANTED_CONSENT } from './googleAds';
import { GoogleAdsHost } from './GoogleAdsHost';

const dataLayerCalls = () =>
  (window.dataLayer || []).map((entry) => Array.from(entry as IArguments));

describe('GoogleAdsHost', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.gtag;
    delete window.dataLayer;
    document.head.innerHTML = '';
  });

  it('keeps Google Ads consent denied until the banner is accepted', () => {
    render(<GoogleAdsHost />);

    expect(dataLayerCalls()).toEqual(
      expect.arrayContaining([
        ['consent', 'default', expect.objectContaining(DENIED_CONSENT)],
        ['consent', 'update', DENIED_CONSENT],
        ['config', GOOGLE_ADS_ID],
      ]),
    );
    expect(dataLayerCalls()).not.toEqual(
      expect.arrayContaining([['consent', 'update', GRANTED_CONSENT]]),
    );
  });

  it('grants Google Ads consent after the cookie banner is accepted', () => {
    render(<GoogleAdsHost />);

    act(() => {
      writeCookieConsent('accepted');
    });

    expect(dataLayerCalls()).toEqual(
      expect.arrayContaining([['consent', 'update', GRANTED_CONSENT]]),
    );
  });

  it('keeps Google Ads consent denied after the cookie banner is declined', () => {
    render(<GoogleAdsHost />);

    act(() => {
      writeCookieConsent('declined');
    });

    const updates = dataLayerCalls().filter(
      (call) => call[0] === 'consent' && call[1] === 'update',
    );
    expect(updates.at(-1)).toEqual(['consent', 'update', DENIED_CONSENT]);
  });

  it('restores granted consent for a returning visitor', () => {
    writeCookieConsent('accepted');

    render(<GoogleAdsHost />);

    expect(dataLayerCalls()).toEqual(
      expect.arrayContaining([['consent', 'update', GRANTED_CONSENT]]),
    );
  });
});
