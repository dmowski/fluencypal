/**
 * @jest-environment jsdom
 */

import { FirebaseError } from 'firebase/app';
import type { Auth, User, UserCredential } from 'firebase/auth';
import { EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';
import {
  AnonymousQuizSnapshot,
  pickQuizAccountSettings,
  QuizPasswordDeps,
  sendQuizPasswordReset,
  submitQuizPasswordAccount,
} from './quizPasswordAccount';

jest.mock('@/features/Analytics/Custom/sendOutcomeEvents', () => ({
  sendUiError: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  EmailAuthProvider: {
    credential: jest.fn(() => ({ providerId: 'password' })),
  },
  linkWithCredential: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const linked = {
  user: { uid: 'anon-1', getIdToken: jest.fn().mockResolvedValue('token') },
} as unknown as UserCredential;
const existing = { user: { uid: 'existing-1' } } as UserCredential;

const authWith = (currentUser: User | null): Auth =>
  ({
    currentUser,
    authStateReady: jest.fn().mockResolvedValue(undefined),
  }) as unknown as Auth;

const snapshot: AnonymousQuizSnapshot = {
  uid: 'anon-1',
  settings: { teacherVoice: 'marin', languageCode: 'en' },
  quiz2: [{ id: 'en', data: { goalData: { id: 'plan' } } }],
};

const deps = (): QuizPasswordDeps => ({
  linkWithCredential: linkWithCredential as QuizPasswordDeps['linkWithCredential'],
  signInWithEmailAndPassword:
    signInWithEmailAndPassword as QuizPasswordDeps['signInWithEmailAndPassword'],
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  readAnonymousQuiz: jest.fn().mockResolvedValue(snapshot),
  writeQuizOntoUser: jest.fn().mockResolvedValue(undefined),
});

describe('submitQuizPasswordAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('links a new password onto the anonymous quiz user', async () => {
    (linkWithCredential as jest.Mock).mockResolvedValue(linked);
    const currentUser = { isAnonymous: true, uid: 'anon-1' } as User;
    const passwordDeps = deps();

    await expect(
      submitQuizPasswordAccount(
        authWith(currentUser),
        { email: 'Person@Example.com', password: 'secret1', mode: 'create' },
        passwordDeps,
      ),
    ).resolves.toEqual({ status: 'linked' });

    expect(EmailAuthProvider.credential).toHaveBeenCalledWith('person@example.com', 'secret1');
    expect(linkWithCredential).toHaveBeenCalledWith(currentUser, { providerId: 'password' });
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(passwordDeps.writeQuizOntoUser).not.toHaveBeenCalled();
    expect(sendUiError).not.toHaveBeenCalled();
  });

  it('does not sign in when the email is already registered', async () => {
    (linkWithCredential as jest.Mock).mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'exists'),
    );
    const passwordDeps = deps();

    await expect(
      submitQuizPasswordAccount(
        authWith({ isAnonymous: true, uid: 'anon-1' } as User),
        { email: 'person@example.com', password: 'secret1', mode: 'create' },
        passwordDeps,
      ),
    ).resolves.toEqual({ status: 'email-taken' });

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(passwordDeps.readAnonymousQuiz).not.toHaveBeenCalled();
    expect(sendUiError).toHaveBeenCalledWith('auth_password_email_taken');
  });

  it('copies the anonymous quiz onto an existing account after sign-in', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(existing);
    const passwordDeps = deps();
    const currentUser = { isAnonymous: true, uid: 'anon-1' } as User;

    await expect(
      submitQuizPasswordAccount(
        authWith(currentUser),
        { email: 'person@example.com', password: 'secret1', mode: 'signIn' },
        passwordDeps,
      ),
    ).resolves.toEqual({ status: 'signed-in' });

    expect(passwordDeps.readAnonymousQuiz).toHaveBeenCalledWith('anon-1');
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(passwordDeps.writeQuizOntoUser).toHaveBeenCalledWith('existing-1', snapshot);
  });

  it('leaves the anonymous quiz in place when the password is wrong', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'nope'),
    );
    const passwordDeps = deps();

    await expect(
      submitQuizPasswordAccount(
        authWith({ isAnonymous: true, uid: 'anon-1' } as User),
        { email: 'person@example.com', password: 'secret1', mode: 'signIn' },
        passwordDeps,
      ),
    ).resolves.toEqual({ status: 'error', code: 'wrong-password' });

    expect(passwordDeps.writeQuizOntoUser).not.toHaveBeenCalled();
    expect(sendUiError).toHaveBeenCalledWith('auth_password_wrong_password');
  });

  it('rejects a short password before calling Firebase', async () => {
    const passwordDeps = deps();

    await expect(
      submitQuizPasswordAccount(
        authWith({ isAnonymous: true, uid: 'anon-1' } as User),
        { email: 'person@example.com', password: 'short', mode: 'create' },
        passwordDeps,
      ),
    ).resolves.toEqual({ status: 'error', code: 'weak-password' });

    expect(linkWithCredential).not.toHaveBeenCalled();
    expect(sendUiError).toHaveBeenCalledWith('auth_password_weak_password');
  });
});

describe('pickQuizAccountSettings', () => {
  it('keeps the quiz choices and drops account billing fields', () => {
    expect(
      pickQuizAccountSettings({
        teacherVoice: 'marin',
        languageCode: 'en',
        email: 'person@example.com',
        isCreditCardConfirmed: true,
        teacherVoiceSpeed: null,
      }),
    ).toEqual({ teacherVoice: 'marin', languageCode: 'en' });
  });
});

describe('sendQuizPasswordReset', () => {
  it('sends a reset for a valid email', async () => {
    const passwordDeps = deps();
    await expect(
      sendQuizPasswordReset(authWith(null), 'Person@Example.com', passwordDeps),
    ).resolves.toEqual({ status: 'sent' });
    expect(passwordDeps.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'person@example.com',
    );
    expect(sendUiError).not.toHaveBeenCalled();
  });

  it('records an invalid reset email', async () => {
    await expect(sendQuizPasswordReset(authWith(null), 'not-an-email', deps())).resolves.toEqual({
      status: 'error',
      code: 'invalid-email',
    });
    expect(sendUiError).toHaveBeenCalledWith('auth_password_reset_invalid_email');
  });
});
