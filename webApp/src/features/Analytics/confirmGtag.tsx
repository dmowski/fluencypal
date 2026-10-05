'use client';

import { isDev } from './isDev';
import { CHECKOUT_CONVERSION, initGTag } from './initGTag';

export { CHECKOUT_CONVERSION };
export const CONVERSION_WAIT_MS = 1500;

let conversionQueued = false;

export const resetCheckoutConversionForTests = () => {
  conversionQueued = false;
};

// "Submit lead form" measures starting Stripe checkout, not a purchase.
export const confirmGtag = async (): Promise<void> => {
  if (typeof window === 'undefined' || isDev()) return;
  if (conversionQueued) return;
  conversionQueued = true;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    // Independent fallback: blockers may prevent gtag's event_timeout from running.
    const timer = setTimeout(finish, CONVERSION_WAIT_MS);
    try {
      initGTag();
      if (!window.gtag) {
        finish();
        return;
      }
      window.gtag('event', 'conversion', {
        send_to: CHECKOUT_CONVERSION,
        value: 1.0,
        currency: 'PLN',
        transport_type: 'beacon',
        event_callback: finish,
        event_timeout: CONVERSION_WAIT_MS,
      });
    } catch {
      // Analytics must never prevent checkout.
      finish();
    }
  });
};
