/**
 * @jest-environment jsdom
 */

import { confirmGtag, resetCheckoutConversionForTests } from './confirmGtag';
import { redirectToStripeCheckout, resetStripeRedirectForTests } from './redirectToStripeCheckout';

jest.mock('./confirmGtag', () => ({
  confirmGtag: jest.fn(() => Promise.resolve()),
  resetCheckoutConversionForTests: jest.fn(),
}));

const mockedConfirm = confirmGtag as jest.MockedFunction<typeof confirmGtag>;

describe('redirectToStripeCheckout', () => {
  const assign = jest.fn();

  beforeEach(() => {
    mockedConfirm.mockReset();
    mockedConfirm.mockResolvedValue(undefined);
    resetCheckoutConversionForTests();
    resetStripeRedirectForTests();
    assign.mockReset();
  });

  it('fires the conversion after a session URL exists, then redirects once', async () => {
    const url = 'https://checkout.stripe.com/c/pay/cs_test_123';

    await redirectToStripeCheckout(url, assign);
    await redirectToStripeCheckout('https://checkout.stripe.com/c/pay/cs_test_other', assign);

    expect(mockedConfirm).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(url);
  });

  it('does not fire a conversion or redirect when the session URL is missing', async () => {
    await expect(redirectToStripeCheckout('', assign)).rejects.toThrow(
      'Stripe checkout URL is missing',
    );

    expect(mockedConfirm).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });
});
