export const isAnonymousSignInProvider = (signInProvider: string | undefined): boolean =>
  signInProvider === 'anonymous';

export const isIdentifiedAuthUser = (user: { isAnonymous?: boolean } | null | undefined): boolean =>
  Boolean(user && user.isAnonymous !== true);

/**
 * linkWithPopup and linkWithCredential keep the same uid, so useAuthState does
 * not re-render. A matching linked uid means that sign-in already finished.
 */
export const isLinkedAuthSettled = (userUid: string | undefined, linkedUid: string): boolean =>
  Boolean(userUid) && linkedUid === userUid;

/**
 * Live auth token updates. `null` clears the flag (signed out). `undefined`
 * leaves it alone (still anonymous). A uid publishes the linked account.
 * Anonymous token events must not clear a flag that a link just set.
 */
/**
 * Google already returned success. Report only when the live session is still
 * anonymous, or the token is ready and React is still a guest with no linked uid.
 * A uid switch that is still waiting for its token is not a failure yet.
 */
export const shouldReportUnchangedGoogleSignIn = ({
  liveUser,
  reactUser,
  linkedUid,
  tokenReadyUid,
}: {
  liveUser: { uid: string; isAnonymous: boolean } | null;
  reactUser: { uid?: string; isAnonymous?: boolean } | null;
  linkedUid: string;
  tokenReadyUid: string | null;
}): boolean => {
  if (!liveUser || liveUser.isAnonymous) return true;
  const tokenReady = tokenReadyUid === liveUser.uid;
  const reactStillAnonymous = !reactUser || reactUser.isAnonymous === true;
  const linkPublished = linkedUid === liveUser.uid;
  return tokenReady && reactStillAnonymous && !linkPublished;
};

export const linkedUidFromAuthChange = (
  user: { uid: string; isAnonymous: boolean } | null,
): string | null | undefined => {
  if (!user) return null;
  if (user.isAnonymous) return undefined;
  return user.uid;
};

export const isSessionAnonymous = ({
  user,
  userId,
  linkedUid,
}: {
  user: { uid?: string; isAnonymous?: boolean } | null | undefined;
  userId: string;
  linkedUid: string;
}): boolean =>
  Boolean(user?.isAnonymous) && userId === user?.uid && !isLinkedAuthSettled(user?.uid, linkedUid);

export const isSessionIdentified = ({
  user,
  userId,
  linkedUid,
  hasAuthError,
}: {
  user: { uid?: string; isAnonymous?: boolean } | null | undefined;
  userId: string;
  linkedUid: string;
  hasAuthError: boolean;
}): boolean =>
  (isIdentifiedAuthUser(user) || isLinkedAuthSettled(user?.uid, linkedUid)) &&
  !hasAuthError &&
  Boolean(userId);
