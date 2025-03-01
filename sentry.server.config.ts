// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
const isDev = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: "https://f683d729da9d8855c7742f03c0caaf55@o4506187426103296.ingest.us.sentry.io/4508885116452864",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  enabled: !isDev,
});
