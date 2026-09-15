export const isIdentifiedAuthUser = (
  user: { isAnonymous?: boolean } | null | undefined,
): boolean => Boolean(user && user.isAnonymous !== true);
