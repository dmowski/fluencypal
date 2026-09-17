/**
 * @jest-environment jsdom
 */

import { ensureAnonymousAuth } from './anonymousAuth';

const signInAnonymously = jest.fn();

jest.mock('firebase/auth', () => ({
  signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
}));

const authWith = (currentUser: { uid: string } | null) =>
  ({
    currentUser,
    authStateReady: () => Promise.resolve(),
  }) as never;

describe('ensureAnonymousAuth', () => {
  beforeEach(() => {
    signInAnonymously.mockReset();
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
      return { user: { uid: 'should-not-run' } };
    });

    const pending = ensureAnonymousAuth(firebaseAuth as never);
    firebaseAuth.currentUser = { uid: 'restored' };
    resolveReady();

    await expect(pending).resolves.toBe('restored');
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('signs in anonymously once when there is no user', async () => {
    signInAnonymously.mockResolvedValue({ user: { uid: 'anon-1' } });

    const [first, second] = await Promise.all([
      ensureAnonymousAuth(authWith(null)),
      ensureAnonymousAuth(authWith(null)),
    ]);

    expect(first).toBe('anon-1');
    expect(second).toBe('anon-1');
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
  });
});
