import * as Sentry from '@sentry/nextjs';
import { sentryIgnoreSpans } from '@/libs/sentry/ignoreSpans';
import { installRscNPlusOneDiagnostics } from '@/libs/sentry/rscNPlusOneDiagnostics';

const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: 'https://f683d729da9d8855c7742f03c0caaf55@o4506187426103296.ingest.us.sentry.io/4508885116452864',
  tracesSampleRate: 1,
  debug: false,
  enabled: !isDev,
  enableLogs: true,
  ignoreSpans: [...sentryIgnoreSpans],
});

// Diagnose Sentry N+1 on identical Next.js RSC flights (e.g. DARK-LANG-HQ).
// Framework issues the duplicate ?_rsc= fetches; this captures stacks/context next time.
installRscNPlusOneDiagnostics();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
