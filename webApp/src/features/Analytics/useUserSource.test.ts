/** @jest-environment jsdom */

import { getParamsFromStorage } from './useUserSource';

const SOURCE_STORAGE_KEY = 'user_source_info';

describe('getParamsFromStorage', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'localStorage', originalDescriptor);
    }
    window.localStorage.clear();
  });

  it('returns parsed source when storage is available', () => {
    window.localStorage.setItem(
      SOURCE_STORAGE_KEY,
      JSON.stringify({ urlPath: '/practice', referrer: '' }),
    );

    expect(getParamsFromStorage()).toEqual({ urlPath: '/practice', referrer: '' });
  });

  it('returns null when the stored path is the analytics tracker iframe', () => {
    window.localStorage.setItem(
      SOURCE_STORAGE_KEY,
      JSON.stringify({ urlPath: '/analytics/tracker', referrer: '' }),
    );

    expect(getParamsFromStorage()).toBeNull();
  });

  it('returns null when reading localStorage is denied', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access is denied', 'SecurityError');
      },
    });

    expect(getParamsFromStorage()).toBeNull();
  });
});
