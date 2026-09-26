/**
 * Firestore listeners and writes must wait until this uid's ID token is minted.
 * Publishing the uid earlier sends requests with a null auth context, and rules
 * reject them as "Missing or insufficient permissions" (DARK-LANG-J4).
 */
export const publishedAuthUid = (
  authUid: string | undefined,
  tokenReadyUid: string | null,
): string => (authUid && tokenReadyUid === authUid ? authUid : '');

export const isWaitingForFirestoreToken = (
  authUid: string | undefined,
  tokenReadyUid: string | null,
): boolean => Boolean(authUid) && tokenReadyUid !== authUid;
