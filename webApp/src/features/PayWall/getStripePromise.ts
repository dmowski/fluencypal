import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | undefined;

/** Loads Stripe.js on first use; rejects are handled so they never surface as unhandled rejections. */
export function getStripePromise(): Promise<Stripe | null> {
  if (stripePromise === undefined) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(publishableKey).catch(() => null);
    }
  }
  return stripePromise;
}
