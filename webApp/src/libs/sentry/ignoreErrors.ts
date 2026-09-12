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
  // Chrome deleted IndexedDB LevelDB files (common on Android storage pressure)
  /Data lost due to missing file/,
  // Safari/WebKit killed the IndexedDB process (DARK-LANG-J2); reload recovers
  /Connection to Indexed Database server lost/,
  // Expected when the browser is offline
  /Failed to get document because the client is offline/,
  // Browser-extension injectors (DARK-LANG-HZ / DARK-LANG-J0); no first-party frames
  /Cannot read properties of undefined \(reading 'M_ID'\)/,
  // Zalo in-app browser injects this global (DARK-LANG-HP); not app code
  /Can't find variable: zaloJSV2/,
  /zaloJSV2 is not defined/,
];
