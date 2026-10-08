import {
  formatHourCount,
  paidAccessCheckoutUsd,
  paidAccessGrantForCheckout,
  paidAccessStripeName,
} from './paidAccessPlans';

describe('paid access plans', () => {
  it('prices the month plans from the payment form', () => {
    expect(paidAccessCheckoutUsd({ plan: 'practice', months: 1, days: 0 })).toBe(6);
    expect(paidAccessCheckoutUsd({ plan: 'conversation', months: 1, days: 0 })).toBe(14);
    expect(paidAccessCheckoutUsd({ plan: 'conversation-10', months: 1, days: 0 })).toBe(64);
  });

  it('keeps the week at half and the year at ten months of the practice price', () => {
    expect(paidAccessCheckoutUsd({ plan: 'practice', months: 0, days: 7 })).toBe(3);
    expect(paidAccessCheckoutUsd({ plan: 'practice', months: 12, days: 0 })).toBe(60);
    expect(paidAccessCheckoutUsd({ plan: 'conversation', months: 0, days: 7 })).toBe(7);
    expect(paidAccessCheckoutUsd({ plan: 'conversation-10', months: 12, days: 0 })).toBe(640);
  });

  it('credits advanced hours on the higher plans and does not sell group conversations', () => {
    expect(paidAccessGrantForCheckout({ plan: 'practice', months: 1, days: 0 })).toEqual({
      advancedHours: 0,
      communityMonths: 0,
      communityDays: 0,
    });
    expect(paidAccessGrantForCheckout({ plan: 'conversation', months: 1, days: 0 })).toEqual({
      advancedHours: 1,
      communityMonths: 0,
      communityDays: 0,
    });
    expect(paidAccessGrantForCheckout({ plan: 'conversation-10', months: 0, days: 7 })).toEqual({
      advancedHours: 5,
      communityMonths: 0,
      communityDays: 0,
    });
    expect(paidAccessGrantForCheckout({ plan: 'conversation', months: 12, days: 0 })).toEqual({
      advancedHours: 10,
      communityMonths: 0,
      communityDays: 0,
    });
  });

  it('does not treat a one-day pass as a paid-access plan', () => {
    expect(paidAccessCheckoutUsd({ plan: 'conversation', months: 0, days: 1 })).toBeNull();
    expect(paidAccessGrantForCheckout({ plan: 'conversation', months: 0, days: 1 })).toEqual({
      advancedHours: 0,
      communityMonths: 0,
      communityDays: 0,
    });
  });

  it('names the Stripe product after the grant', () => {
    expect(paidAccessStripeName('practice', 1, 0)).toBe(
      'FluencyPal English language course — paid access for a month',
    );
    expect(paidAccessStripeName('conversation', 1, 0)).toBe(
      'FluencyPal English language course — paid access for a month, including 1 hour of conversation practice',
    );
    expect(paidAccessStripeName('conversation-10', 1, 0)).toBe(
      'FluencyPal English language course — paid access for a month, including 10 hours of conversation practice',
    );
    expect(formatHourCount(0.5)).toBe('30 minutes');
  });
});
