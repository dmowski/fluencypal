import { isFetchNetworkError } from './isFetchNetworkError';

describe('isFetchNetworkError', () => {
  it('matches Safari Load failed', () => {
    expect(isFetchNetworkError(new TypeError('Load failed'))).toBe(true);
  });

  it('matches Chromium Failed to fetch', () => {
    expect(isFetchNetworkError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('rejects app-level fetch errors', () => {
    expect(isFetchNetworkError(new Error('Failed to initialize user settings'))).toBe(false);
    expect(isFetchNetworkError(new TypeError('Cannot read properties of null'))).toBe(false);
    expect(isFetchNetworkError(null)).toBe(false);
  });
});
