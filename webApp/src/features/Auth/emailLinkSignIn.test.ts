/**
 * @jest-environment jsdom
 */

import { FirebaseError } from 'firebase/app';
import type { Auth, User, UserCredential } from 'firebase/auth';
import {
  EmailAuthProvider,
  linkWithCredential,
  signInWithCredential,
  signInWithEmailLink,
} from 'firebase/auth';
import { completeEmailLinkSignIn } from './emailLinkSignIn';

jest.mock('firebase/auth', () => ({
  EmailAuthProvider: {
    credentialWithLink: jest.fn(() => ({ providerId: 'emailLink' })),
  },
  linkWithCredential: jest.fn(),
  signInWithEmailLink: jest.fn(),
  signInWithCredential: jest.fn(),
}));

const credential = { user: { uid: 'linked' } } as UserCredential;

const authWith = (currentUser: User | null): Auth =>
  ({
    currentUser,
    authStateReady: jest.fn().mockResolvedValue(undefined),
  }) as unknown as Auth;

describe('completeEmailLinkSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('links an anonymous user so the uid does not change', async () => {
    (linkWithCredential as jest.Mock).mockResolvedValue(credential);
    const currentUser = { isAnonymous: true } as User;

    await expect(
      completeEmailLinkSignIn(
        authWith(currentUser),
        'person@example.com',
        'https://app.example/link',
      ),
    ).resolves.toBe(credential);

    expect(EmailAuthProvider.credentialWithLink).toHaveBeenCalledWith(
      'person@example.com',
      'https://app.example/link',
    );
    expect(linkWithCredential).toHaveBeenCalledWith(currentUser, { providerId: 'emailLink' });
    expect(signInWithEmailLink).not.toHaveBeenCalled();
  });

  it('signs into an existing account when the email is already registered', async () => {
    const error = new FirebaseError('auth/email-already-in-use', 'exists');
    (linkWithCredential as jest.Mock).mockRejectedValue(error);
    (signInWithCredential as jest.Mock).mockResolvedValue(credential);
    const firebaseAuth = authWith({ isAnonymous: true } as User);

    await expect(
      completeEmailLinkSignIn(firebaseAuth, 'person@example.com', 'https://app.example/link'),
    ).resolves.toBe(credential);

    expect(signInWithCredential).toHaveBeenCalledWith(firebaseAuth, { providerId: 'emailLink' });
  });

  it('signs in with the link when there is no anonymous user to keep', async () => {
    (signInWithEmailLink as jest.Mock).mockResolvedValue(credential);

    await completeEmailLinkSignIn(authWith(null), 'person@example.com', 'https://app.example/link');
    await completeEmailLinkSignIn(
      authWith({ isAnonymous: false } as User),
      'person@example.com',
      'https://app.example/link',
    );

    expect(signInWithEmailLink).toHaveBeenCalledTimes(2);
    expect(linkWithCredential).not.toHaveBeenCalled();
  });
});
