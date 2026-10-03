import {
  isAnonymousSignInProvider,
  isIdentifiedAuthUser,
  isSessionAnonymous,
  isSessionIdentified,
  linkedUidFromAuthChange,
  shouldReportUnchangedGoogleSignIn,
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

describe('shouldReportUnchangedGoogleSignIn', () => {
  const anonymous = { uid: 'anon-1', isAnonymous: true };
  const google = { uid: 'anon-1', isAnonymous: false };

  it('reports when Google finished and the live user is still anonymous', () => {
    expect(
      shouldReportUnchangedGoogleSignIn({
        liveUser: anonymous,
        reactUser: anonymous,
        linkedUid: '',
        tokenReadyUid: 'anon-1',
      }),
    ).toBe(true);
    expect(
      shouldReportUnchangedGoogleSignIn({
        liveUser: null,
        reactUser: anonymous,
        linkedUid: '',
        tokenReadyUid: 'anon-1',
      }),
    ).toBe(true);
  });

  it('stays quiet when the linked uid is published or the new token is still minting', () => {
    expect(
      shouldReportUnchangedGoogleSignIn({
        liveUser: google,
        reactUser: anonymous,
        linkedUid: 'anon-1',
        tokenReadyUid: 'anon-1',
      }),
    ).toBe(false);
    expect(
      shouldReportUnchangedGoogleSignIn({
        liveUser: { uid: 'google-2', isAnonymous: false },
        reactUser: anonymous,
        linkedUid: '',
        tokenReadyUid: 'anon-1',
      }),
    ).toBe(false);
  });

  it('reports when the token is ready and React never left the guest snapshot', () => {
    expect(
      shouldReportUnchangedGoogleSignIn({
        liveUser: google,
        reactUser: anonymous,
        linkedUid: '',
        tokenReadyUid: 'anon-1',
      }),
    ).toBe(true);
  });
});

describe('linkedUidFromAuthChange', () => {
  it('publishes a Google user and ignores a still-anonymous token', () => {
    expect(linkedUidFromAuthChange({ uid: 'anon-1', isAnonymous: false })).toBe('anon-1');
    expect(linkedUidFromAuthChange({ uid: 'anon-1', isAnonymous: true })).toBeUndefined();
  });

  it('clears the flag when the session is gone', () => {
    expect(linkedUidFromAuthChange(null)).toBeNull();
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
