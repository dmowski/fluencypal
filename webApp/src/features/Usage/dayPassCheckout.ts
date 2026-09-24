import { SupportedLanguage } from '@/features/Lang/lang';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { createStripeCheckout } from './createStripeCheckout';
import { sentPaymentTgMessage } from './sentTgMessage';

export const DAY_PASS_CHECKOUT_KEY = 'fp_dayPassCheckout';

export const markDayPassCheckout = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DAY_PASS_CHECKOUT_KEY, '1');
};

export const clearDayPassCheckout = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DAY_PASS_CHECKOUT_KEY);
};

export const consumeDayPassCheckout = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.sessionStorage.getItem(DAY_PASS_CHECKOUT_KEY) !== '1') return false;
  window.sessionStorage.removeItem(DAY_PASS_CHECKOUT_KEY);
  return true;
};

let dayPassCheckoutInFlight: Promise<string | null> | null = null;

const startDayPassCheckoutOnce = async (input: {
  userId: string;
  token: string;
  languageCode: SupportedLanguage;
  currency: string;
  email?: string | null;
}): Promise<string | null> => {
  sendAnalyticsEvent({ name: 'checkout_start', ctaId: 'day-pass' });

  const checkoutInfo = await createStripeCheckout(
    {
      userId: input.userId,
      months: 0,
      days: 1,
      languageCode: input.languageCode,
      currency: input.currency,
    },
    input.token,
  );

  if (!checkoutInfo.sessionUrl) {
    return null;
  }

  await sentPaymentTgMessage({
    message: `Event: Redirect to stripe | day, ${input.currency}`,
    email: input.email || 'unknownEmail',
    token: input.token,
  });

  return checkoutInfo.sessionUrl;
};

export const startDayPassCheckout = (input: {
  userId: string;
  token: string;
  languageCode: SupportedLanguage;
  currency: string;
  email?: string | null;
}): Promise<string | null> => {
  if (dayPassCheckoutInFlight) return dayPassCheckoutInFlight;
  dayPassCheckoutInFlight = startDayPassCheckoutOnce(input).finally(() => {
    dayPassCheckoutInFlight = null;
  });
  return dayPassCheckoutInFlight;
};
