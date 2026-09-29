import { FirebaseError } from 'firebase/app';
import { sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';
import { normalizeEmail } from './normalizeEmail';
import {
  Auth,
  EmailAuthProvider,
  UserCredential,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

export const MIN_QUIZ_PASSWORD_LENGTH = 6;

const QUIZ_ACCOUNT_SETTING_KEYS = [
  'languageCode',
  'pageLanguageCode',
  'nativeLanguageCode',
  'teacherVoice',
  'teacherVoiceSpeed',
  'recentLearnLanguages',
] as const;

export type QuizPasswordMode = 'create' | 'signIn';

export type QuizPasswordErrorCode =
  | 'invalid-email'
  | 'weak-password'
  | 'wrong-password'
  | 'too-many-requests'
  | 'network'
  | 'unavailable'
  | 'save-failed'
  | 'no-session'
  | 'unknown';

export type AnonymousQuizSnapshot = {
  uid: string;
  settings: Record<string, unknown> | null;
  quiz2: Array<{ id: string; data: Record<string, unknown> }>;
};

export type QuizPasswordDeps = {
  linkWithCredential: typeof linkWithCredential;
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
  readAnonymousQuiz: (uid: string) => Promise<AnonymousQuizSnapshot>;
  writeQuizOntoUser: (uid: string, snapshot: AnonymousQuizSnapshot) => Promise<void>;
};

export type QuizPasswordResult =
  | { status: 'linked' }
  | { status: 'signed-in' }
  | { status: 'email-taken' }
  | { status: 'error'; code: QuizPasswordErrorCode };

export type QuizPasswordResetResult =
  | { status: 'sent' }
  | { status: 'error'; code: QuizPasswordErrorCode };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const pickQuizAccountSettings = (
  data: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null => {
  if (!data) return null;
  const picked: Record<string, unknown> = {};
  for (const key of QUIZ_ACCOUNT_SETTING_KEYS) {
    const value = data[key];
    if (value != null) picked[key] = value;
  }
  return Object.keys(picked).length > 0 ? picked : null;
};

export const validateQuizPasswordInput = (
  email: string,
  password: string,
): QuizPasswordErrorCode | null => {
  if (!emailPattern.test(normalizeEmail(email))) return 'invalid-email';
  if (password.length < MIN_QUIZ_PASSWORD_LENGTH) return 'weak-password';
  return null;
};

const reportQuizPasswordError = (scope: 'account' | 'reset', code: string): void => {
  const name = code.replace(/-/g, '_');
  sendUiError(scope === 'reset' ? `auth_password_reset_${name}` : `auth_password_${name}`);
};

const accountError = (code: QuizPasswordErrorCode): QuizPasswordResult => {
  reportQuizPasswordError('account', code);
  return { status: 'error', code };
};

const accountEmailTaken = (): QuizPasswordResult => {
  reportQuizPasswordError('account', 'email-taken');
  return { status: 'email-taken' };
};

const resetError = (code: QuizPasswordErrorCode): QuizPasswordResetResult => {
  reportQuizPasswordError('reset', code);
  return { status: 'error', code };
};

const isEmailAlreadyInUse = (error: unknown): boolean =>
  error instanceof FirebaseError &&
  (error.code === 'auth/email-already-in-use' || error.code === 'auth/credential-already-in-use');

export const quizPasswordErrorCode = (error: unknown): QuizPasswordErrorCode => {
  if (!(error instanceof FirebaseError)) return 'unknown';
  switch (error.code) {
    case 'auth/invalid-email':
      return 'invalid-email';
    case 'auth/weak-password':
    case 'auth/missing-password':
      return 'weak-password';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'wrong-password';
    case 'auth/too-many-requests':
      return 'too-many-requests';
    case 'auth/network-request-failed':
      return 'network';
    case 'auth/operation-not-allowed':
      return 'unavailable';
    default:
      return 'unknown';
  }
};

/**
 * Create keeps the anonymous quiz uid by linking the password onto it.
 * Sign-in reads that quiz first, then copies it onto the existing account
 * after the uid changes.
 */
export const submitQuizPasswordAccount = async (
  auth: Auth,
  input: { email: string; password: string; mode: QuizPasswordMode },
  deps: QuizPasswordDeps,
): Promise<QuizPasswordResult> => {
  const email = normalizeEmail(input.email);
  const invalid = validateQuizPasswordInput(email, input.password);
  if (invalid) return accountError(invalid);

  await auth.authStateReady();
  const currentUser = auth.currentUser;
  if (currentUser && !currentUser.isAnonymous) {
    return { status: 'signed-in' };
  }

  if (input.mode === 'create') {
    if (!currentUser?.isAnonymous) {
      return accountError('no-session');
    }
    try {
      const credential = EmailAuthProvider.credential(email, input.password);
      const linkedUser = await deps.linkWithCredential(currentUser, credential);
      // Linking revokes the anonymous ID token. Refresh before Firestore reads the plan.
      await linkedUser.user.getIdToken(true);
      return { status: 'linked' };
    } catch (error) {
      if (isEmailAlreadyInUse(error)) return accountEmailTaken();
      return accountError(quizPasswordErrorCode(error));
    }
  }

  let snapshot: AnonymousQuizSnapshot | null = null;
  if (currentUser?.isAnonymous) {
    try {
      snapshot = await deps.readAnonymousQuiz(currentUser.uid);
    } catch {
      return accountError('save-failed');
    }
  }

  let signedIn: UserCredential;
  try {
    signedIn = await deps.signInWithEmailAndPassword(auth, email, input.password);
  } catch (error) {
    return accountError(quizPasswordErrorCode(error));
  }

  if (snapshot && signedIn.user.uid !== snapshot.uid) {
    try {
      await deps.writeQuizOntoUser(signedIn.user.uid, snapshot);
    } catch {
      return accountError('save-failed');
    }
  }

  return { status: 'signed-in' };
};

export const sendQuizPasswordReset = async (
  auth: Auth,
  email: string,
  deps: Pick<QuizPasswordDeps, 'sendPasswordResetEmail'>,
): Promise<QuizPasswordResetResult> => {
  const normalized = normalizeEmail(email);
  if (!emailPattern.test(normalized)) return resetError('invalid-email');
  try {
    await deps.sendPasswordResetEmail(auth, normalized);
    return { status: 'sent' };
  } catch (error) {
    return resetError(quizPasswordErrorCode(error));
  }
};
