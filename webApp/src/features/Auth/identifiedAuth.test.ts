import {
  isAnonymousSignInProvider,
  isIdentifiedAuthUser,
  isSessionAnonymous,
  isSessionIdentified,
} from './identifiedAuth';

describe('isIdentifiedAuthUser', () => {
  it('is false for missing or anonymous users', () => {
    expect(isIdentifiedAuthUser(null)).toBe(false);
    expect(isIdentifiedAuthUser(undefined)).toBe(false);
    expect(isIdentifiedAuthUser({ isAnonymous: true })).toBe(false);
  });

  it('is true for Google or email accounts', () => {
    expect(isIdentifiedAuthUser({ isAnonymous: false })).toBe(true);
    expect(isIdentifiedAuthUser({})).toBe(true);
  });
});

describe('isSessionIdentified', () => {
  const anonymousUser = { uid: 'anon-1', isAnonymous: true };

  it('treats a linked anonymous uid as signed in', () => {
    const session = {
      user: anonymousUser,
      userId: 'anon-1',
      linkedUid: 'anon-1',
      hasAuthError: false,
    };
    expect(isSessionIdentified(session)).toBe(true);
    expect(isSessionAnonymous(session)).toBe(false);
  });

  it('stays a guest until the link uid matches the current user', () => {
    const session = {
      user: anonymousUser,
      userId: 'anon-1',
      linkedUid: '',
      hasAuthError: false,
    };
    expect(isSessionIdentified(session)).toBe(false);
    expect(isSessionAnonymous(session)).toBe(true);
    expect(isSessionIdentified({ ...session, linkedUid: 'other-user' })).toBe(false);
  });

  it('stays unidentified when auth failed or the token is not ready', () => {
    expect(
      isSessionIdentified({
        user: anonymousUser,
        userId: 'anon-1',
        linkedUid: 'anon-1',
        hasAuthError: true,
      }),
    ).toBe(false);
    expect(
      isSessionIdentified({
        user: anonymousUser,
        userId: '',
        linkedUid: 'anon-1',
        hasAuthError: false,
      }),
    ).toBe(false);
  });
});

describe('isAnonymousSignInProvider', () => {
  it('is true only for anonymous Firebase sessions', () => {
    expect(isAnonymousSignInProvider('anonymous')).toBe(true);
    expect(isAnonymousSignInProvider('google.com')).toBe(false);
    expect(isAnonymousSignInProvider('password')).toBe(false);
    expect(isAnonymousSignInProvider(undefined)).toBe(false);
  });
});
