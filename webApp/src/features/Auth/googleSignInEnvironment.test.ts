/**
 * @jest-environment jsdom
 */

import {
  isMobileUserAgent,
  isSafariUserAgent,
  shouldUseRedirectSignIn,
} from './googleSignInEnvironment';

describe('googleSignInEnvironment', () => {
  it('detects desktop Safari', () => {
    expect(
      isSafariUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      ),
    ).toBe(true);
  });

  it('does not treat desktop Chrome as Safari', () => {
    expect(
      isSafariUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ),
    ).toBe(false);
  });

  it('detects phones as mobile', () => {
    expect(
      isMobileUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5, true),
    ).toBe(true);
    expect(
      isMobileUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120.0.0.0', 5, true),
    ).toBe(true);
  });

  it('prefers redirect on desktop Safari', () => {
    expect(
      shouldUseRedirectSignIn({
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        isWebView: false,
      }),
    ).toBe(true);
  });

  it('keeps popups on desktop Chrome', () => {
    expect(
      shouldUseRedirectSignIn({
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        isWebView: false,
      }),
    ).toBe(false);
  });

  it('prefers redirect on mobile Chrome', () => {
    expect(
      shouldUseRedirectSignIn({
        ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        isWebView: false,
      }),
    ).toBe(true);
  });

  it('does not redirect in in-app browsers', () => {
    expect(
      shouldUseRedirectSignIn({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Instagram',
        isWebView: true,
      }),
    ).toBe(false);
  });
});
