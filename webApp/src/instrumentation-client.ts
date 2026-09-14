import * as Sentry from '@sentry/nextjs';
import { sentryDenyUrls } from '@/libs/sentry/denyUrls';
import { sentryIgnoreErrors } from '@/libs/sentry/ignoreErrors';
import {
  sentryIgnoreSpans,
  shouldCreateSentrySpanForRequest,
} from '@/libs/sentry/ignoreSpans';
import { installRscNPlusOneDiagnostics } from '@/libs/sentry/rscNPlusOneDiagnostics';

const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: 'https://f683d729da9d8855c7742f03c0caaf55@o4506187426103296.ingest.us.sentry.io/4508885116452864',
  tracesSampleRate: 1,
  debug: false,
  enabled: !isDev,
  enableLogs: true,
  ignoreSpans: [...sentryIgnoreSpans],
  ignoreErrors: sentryIgnoreErrors,
  denyUrls: sentryDenyUrls,
  integrations: [
    Sentry.browserTracingIntegration({
      shouldCreateSpanForRequest: shouldCreateSentrySpanForRequest,
    }),
  ],
});

// Breadcrumb-only: Next.js issues duplicate ?_rsc= flights on App Router navigations
// (DARK-LANG-HQ / DARK-LANG-HR). Do not captureMessage — it created new issues.
installRscNPlusOneDiagnostics();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
