/**
 * @jest-environment jsdom
 */

import { ensureAnonymousAuth, shouldDeferAnonymousAuth } from './anonymousAuth';
import { completeGoogleRedirectSignIn } from './googleSignIn';

const signInAnonymously = jest.fn();
const isSignInWithEmailLink = jest.fn();

jest.mock('firebase/auth', () => ({
  signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
  isSignInWithEmailLink: (...args: unknown[]) => isSignInWithEmailLink(...args),
}));

jest.mock('./googleSignIn', () => ({
  completeGoogleRedirectSignIn: jest.fn().mockResolvedValue(null),
}));

const authWith = (currentUser: { uid: string } | null) =>
  ({
    currentUser,
    authStateReady: () => Promise.resolve(),
  }) as never;

const anonymousUser = (uid: string) => ({
  uid,
  getIdToken: jest.fn().mockResolvedValue('id-token'),
});

describe('ensureAnonymousAuth', () => {
  beforeEach(() => {
    signInAnonymously.mockReset();
    isSignInWithEmailLink.mockReset();
    isSignInWithEmailLink.mockReturnValue(false);
    jest.mocked(completeGoogleRedirectSignIn).mockReset();
    jest.mocked(completeGoogleRedirectSignIn).mockResolvedValue(null);
  });

  it('finishes a Google redirect before creating an anonymous user', async () => {
    const firebaseAuth = {
      currentUser: null as { uid: string } | null,
      authStateReady: () => Promise.resolve(),
    };
    jest.mocked(completeGoogleRedirectSignIn).mockImplementation(async () => {
      firebaseAuth.currentUser = { uid: 'google-user' };
      return { user: firebaseAuth.currentUser } as never;
    });

    await expect(ensureAnonymousAuth(firebaseAuth as never)).resolves.toBe('google-user');
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('returns the existing uid without signing in again', async () => {
    await expect(ensureAnonymousAuth(authWith({ uid: 'already' }))).resolves.toBe('already');
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('waits for authStateReady before creating an anonymous user', async () => {
    let resolveReady: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => {
      resolveReady = resolve;
    });
    const firebaseAuth = {
      currentUser: null as { uid: string } | null,
      authStateReady: () => ready,
    };
    signInAnonymously.mockImplementation(async () => {
      expect(firebaseAuth.currentUser).toEqual({ uid: 'restored' });
      return { user: { uid: 'should-not-run', getIdToken: jest.fn() } };
    });

    const pending = ensureAnonymousAuth(firebaseAuth as never);
    firebaseAuth.currentUser = { uid: 'restored' };
    resolveReady();

    await expect(pending).resolves.toBe('restored');
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('signs in anonymously once when there is no user', async () => {
    const user = anonymousUser('anon-1');
    signInAnonymously.mockResolvedValue({ user });

    const [first, second] = await Promise.all([
      ensureAnonymousAuth(authWith(null)),
      ensureAnonymousAuth(authWith(null)),
    ]);

    expect(first).toBe('anon-1');
    expect(second).toBe('anon-1');
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
    expect(user.getIdToken).toHaveBeenCalledTimes(1);
  });

  it('does not create an anonymous user on an email sign-in link', async () => {
    isSignInWithEmailLink.mockReturnValue(true);

    await expect(ensureAnonymousAuth(authWith(null))).resolves.toBe('');
    expect(shouldDeferAnonymousAuth(authWith(null))).toBe(true);
    expect(signInAnonymously).not.toHaveBeenCalled();
  });
});
