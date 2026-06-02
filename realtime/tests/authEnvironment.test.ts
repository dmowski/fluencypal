import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isInAppBrowser,
  isMobileDevice,
  shouldUseRedirectSignIn,
} from '../test-client/src/authEnvironment.js';

const stubNavigator = (userAgent: string, maxTouchPoints = 0) => {
  vi.stubGlobal('navigator', { userAgent, maxTouchPoints });
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({ matches: query.includes('coarse') }),
  });
};

describe('authEnvironment', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects mobile user agents', () => {
    stubNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5);
    expect(isMobileDevice()).toBe(true);
  });

  it('detects in-app browsers', () => {
    stubNavigator('Mozilla/5.0 Instagram 123');
    expect(isInAppBrowser()).toBe(true);
  });

  it('prefers redirect on mobile but not in-app browsers', () => {
    stubNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5);
    expect(shouldUseRedirectSignIn()).toBe(true);

    stubNavigator('Mozilla/5.0 Instagram', 5);
    expect(shouldUseRedirectSignIn()).toBe(false);
  });

  it('prefers redirect on Safari desktop', () => {
    stubNavigator(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    );
    expect(shouldUseRedirectSignIn()).toBe(true);
  });
});
