/**
 * @jest-environment jsdom
 */

import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { createStripeCheckout } from './createStripeCheckout';
import {
  clearDayPassCheckout,
  consumeDayPassCheckout,
  markDayPassCheckout,
  startDayPassCheckout,
} from './dayPassCheckout';
import { sentPaymentTgMessage } from './sentTgMessage';

jest.mock('@/features/Analytics/Custom/sendAnalyticsEvent', () => ({
  sendAnalyticsEvent: jest.fn(),
}));

jest.mock('./createStripeCheckout', () => ({
  createStripeCheckout: jest.fn(),
}));

jest.mock('./sentTgMessage', () => ({
  sentPaymentTgMessage: jest.fn(async () => undefined),
}));

describe('day pass checkout flag', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('is consumed once', () => {
    expect(consumeDayPassCheckout()).toBe(false);
    markDayPassCheckout();
    expect(consumeDayPassCheckout()).toBe(true);
    expect(consumeDayPassCheckout()).toBe(false);
  });

  it('clears a pending checkout', () => {
    markDayPassCheckout();
    clearDayPassCheckout();
    expect(consumeDayPassCheckout()).toBe(false);
  });
});

describe('startDayPassCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks Stripe for one day and reports checkout_start', async () => {
    (createStripeCheckout as jest.Mock).mockResolvedValue({
      sessionUrl: 'https://checkout.stripe.com/day',
      error: null,
    });

    const sessionUrl = await startDayPassCheckout({
      userId: 'user-1',
      token: 'token-1',
      languageCode: 'en',
      currency: 'USD',
      email: 'learner@example.com',
    });

    expect(sessionUrl).toBe('https://checkout.stripe.com/day');
    expect(sendAnalyticsEvent).toHaveBeenCalledWith({
      name: 'checkout_start',
      ctaId: 'day-pass',
    });
    expect(createStripeCheckout).toHaveBeenCalledWith(
      {
        userId: 'user-1',
        months: 0,
        days: 1,
        languageCode: 'en',
        currency: 'USD',
      },
      'token-1',
    );
    expect(sentPaymentTgMessage).toHaveBeenCalled();
  });

  it('opens one Stripe session when checkout is requested twice at once', async () => {
    let resolveCheckout: (value: { sessionUrl: string; error: null }) => void = () => undefined;
    (createStripeCheckout as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCheckout = resolve;
        }),
    );

    const input = {
      userId: 'user-1',
      token: 'token-1',
      languageCode: 'en' as const,
      currency: 'USD',
      email: 'learner@example.com',
    };
    const first = startDayPassCheckout(input);
    const second = startDayPassCheckout(input);
    resolveCheckout({ sessionUrl: 'https://checkout.stripe.com/day', error: null });

    await expect(first).resolves.toBe('https://checkout.stripe.com/day');
    await expect(second).resolves.toBe('https://checkout.stripe.com/day');
    expect(createStripeCheckout).toHaveBeenCalledTimes(1);
    expect(sendAnalyticsEvent).toHaveBeenCalledTimes(1);
  });
});
