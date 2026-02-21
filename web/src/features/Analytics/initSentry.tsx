'use client';

import * as Sentry from '@sentry/nextjs';

export const initSentry = () => {
  Sentry.init({
    dsn: 'https://f683d729da9d8855c7742f03c0caaf55@o4506187426103296.ingest.us.sentry.io/4508885116452864',

    // Add optional integrations for additional features
    integrations: [],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    enabled: true,

    /*
  sendDefaultPii: false,

  beforeSend(event) {
    // Remove IP address
    if (event.user) {
      delete event.user.ip_address;
    }

    // Remove other identifying data
    event.user = undefined;
    return event;
  },*/
  });
};
