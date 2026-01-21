const isStripeLive = process.env.STRIPE_IS_LIVE === 'live';

export const stripeConfig = {
  isStripeLive,
  STRIPE_WEBHOOK_SECRET: isStripeLive
    ? process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET_TEST,
  STRIPE_SECRET_KEY: isStripeLive
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY_TEST,
};
