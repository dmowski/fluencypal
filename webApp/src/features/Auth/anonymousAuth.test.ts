/**
 * @jest-environment jsdom
 */

import { ensureAnonymousAuth } from './anonymousAuth';

const signInAnonymously = jest.fn();

jest.mock('firebase/auth', () => ({
  signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
}));

describe('ensureAnonymousAuth', () => {
  beforeEach(() => {
    signInAnonymously.mockReset();
  });

  it('returns the existing uid without signing in again', async () => {
    const firebaseAuth = { currentUser: { uid: 'already' } } as never;
    await expect(ensureAnonymousAuth(firebaseAuth)).resolves.toBe('already');
    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('signs in anonymously once when there is no user', async () => {
    signInAnonymously.mockResolvedValue({ user: { uid: 'anon-1' } });
    const firebaseAuth = { currentUser: null } as never;

    const [first, second] = await Promise.all([
      ensureAnonymousAuth(firebaseAuth),
      ensureAnonymousAuth(firebaseAuth),
    ]);

    expect(first).toBe('anon-1');
    expect(second).toBe('anon-1');
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
  });
});
