/**
 * Spans that look like N+1 to Sentry but are normal long-poll / beacon traffic.
 * - Firestore Listen/Write channels: WebChannel long-polling (DARK-LANG-AX / DARK-LANG-AW)
 * - GA collect: analytics beacons grouped under navigation transactions
 * - Next.js `?_rsc=` flight/prefetch requests (DARK-LANG-CX / DARK-LANG-A8)
 *
 * Browser http.client spans are often named just `GET`, so name-based ignoreSpans
 * miss RSC flights. `shouldCreateSentrySpanForRequest` drops them at fetch time.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#ignoreSpans
 */
export const sentryIgnoreSpans = [
  {
    op: 'http.client',
    name: /firestore\.googleapis\.com\/google\.firestore\.v1\.Firestore\/(Listen|Write)\/channel/,
  },
  {
    op: 'http.client',
    name: /google-analytics\.com\/g\/collect/,
  },
  // Matches only when the span name still includes the query string.
  {
    op: 'http.client',
    name: /[?&]_rsc=/,
  },
  {
    name: /_rsc=/,
  },
] as const;

/** Next.js App Router flights are not app API calls; skip tracing them (DARK-LANG-A8). */
export const shouldCreateSentrySpanForRequest = (url: string): boolean =>
  !/[?&]_rsc=/.test(url);
