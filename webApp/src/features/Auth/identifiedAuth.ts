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
