export const isAnonymousSignInProvider = (signInProvider: string | undefined): boolean =>
  signInProvider === 'anonymous';

export const isIdentifiedAuthUser = (user: { isAnonymous?: boolean } | null | undefined): boolean =>
  Boolean(user && user.isAnonymous !== true);
