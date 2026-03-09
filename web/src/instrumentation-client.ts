import * as Sentry from '@sentry/nextjs';

const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: 'https://f683d729da9d8855c7742f03c0caaf55@o4506187426103296.ingest.us.sentry.io/4508885116452864',
  tracesSampleRate: 1,
  debug: false,
  enabled: !isDev,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
