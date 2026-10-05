import { confirmGtag } from './confirmGtag';

let redirectInFlight: Promise<void> | null = null;

export const resetStripeRedirectForTests = () => {
  redirectInFlight = null;
};

const defaultAssign = (url: string) => {
  window.location.assign(url);
};

// Call only after successful session creation and validation of its URL.
export const redirectToStripeCheckout = (
  sessionUrl: string,
  assign: (url: string) => void = defaultAssign,
): Promise<void> => {
  if (!sessionUrl) return Promise.reject(new Error('Stripe checkout URL is missing'));
  if (redirectInFlight) return redirectInFlight;
  redirectInFlight = (async () => {
    try {
      await confirmGtag();
      assign(sessionUrl);
    } catch (error) {
      redirectInFlight = null;
      throw error;
    }
  })();
  return redirectInFlight;
};
