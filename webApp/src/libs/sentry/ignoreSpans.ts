/**
 * Spans that look like N+1 to Sentry but are normal long-poll / beacon traffic.
 * - Firestore Listen/Write channels: WebChannel long-polling (DARK-LANG-AX / DARK-LANG-AW)
 * - GA collect: analytics beacons grouped under navigation transactions
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
] as const;
