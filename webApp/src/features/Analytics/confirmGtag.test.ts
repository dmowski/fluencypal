/**
 * @jest-environment jsdom
 */

import { isDev } from './isDev';
import {
  CHECKOUT_CONVERSION,
  CONVERSION_WAIT_MS,
  confirmGtag,
  resetCheckoutConversionForTests,
} from './confirmGtag';
import { CHECKOUT_CONVERSION_LABEL } from './initGTag';

jest.mock('./isDev', () => ({
  isDev: jest.fn(() => false),
}));

const mockedIsDev = isDev as jest.MockedFunction<typeof isDev>;

describe('confirmGtag', () => {
  beforeEach(() => {
    mockedIsDev.mockReturnValue(false);
    resetCheckoutConversionForTests();
    delete window.gtag;
    delete window.dataLayer;
    document.head.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends the checkout conversion once and resolves from the tag callback', async () => {
    const gtag = jest.fn((...args: unknown[]) => {
      const params = args[2] as { event_callback?: () => void };
      params.event_callback?.();
    });
    window.gtag = gtag;

    await confirmGtag();

    expect(CHECKOUT_CONVERSION_LABEL).toBe('a8vxCK7hpPUaENzTpao9');
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'conversion',
      expect.objectContaining({
        send_to: CHECKOUT_CONVERSION,
        value: 1,
        currency: 'PLN',
        transport_type: 'beacon',
        event_timeout: CONVERSION_WAIT_MS,
      }),
    );
    const params = gtag.mock.calls[0][2] as Record<string, unknown>;
    expect(params).not.toHaveProperty('email');
    expect(JSON.stringify(params)).not.toMatch(/@/);

    gtag.mockClear();
    await confirmGtag();
    expect(gtag).not.toHaveBeenCalled();
  });

  it('resolves when the tag never calls back', async () => {
    window.gtag = jest.fn();

    const pending = confirmGtag();
    await jest.advanceTimersByTimeAsync(CONVERSION_WAIT_MS);

    await expect(pending).resolves.toBeUndefined();
  });

  it('does not send a conversion in local development', async () => {
    mockedIsDev.mockReturnValue(true);
    window.gtag = jest.fn();

    await confirmGtag();

    expect(window.gtag).not.toHaveBeenCalled();
  });
});
