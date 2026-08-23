/**
 * Client error patterns that are environmental / SDK noise, not app bugs.
 * Used with Sentry `ignoreErrors`.
 */
export const sentryIgnoreErrors: Array<string | RegExp> = [
  // Corrupt / aborted Firestore IndexedDB persistence (cascade after storage failure)
  /FIRESTORE \(.*\) INTERNAL ASSERTION FAILED/,
  /Cannot read properties of null \(reading 'prefixPath'\)/,
  /Failed to persist write: IndexedDbTransactionError/,
  /IndexedDB transaction .* failed/,
  /AbortError: The transaction was aborted/,
  // Expected when the browser is offline
  /Failed to get document because the client is offline/,
];
