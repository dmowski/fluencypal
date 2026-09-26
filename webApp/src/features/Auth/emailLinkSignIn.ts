import { FirebaseError } from 'firebase/app';
import {
  Auth,
  EmailAuthProvider,
  UserCredential,
  linkWithCredential,
  signInWithCredential,
  signInWithEmailLink,
} from 'firebase/auth';

const isEmailCredentialAlreadyInUse = (error: unknown): error is FirebaseError =>
  error instanceof FirebaseError &&
  (error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use');

type EmailLinkDeps = {
  linkWithCredential: typeof linkWithCredential;
  signInWithEmailLink: typeof signInWithEmailLink;
  signInWithCredential: typeof signInWithCredential;
};

const defaultDeps: EmailLinkDeps = {
  linkWithCredential,
  signInWithEmailLink,
  signInWithCredential,
};

/**
 * Anonymous quiz/practice progress lives on users/{uid}. Replacing that user
 * with signInWithEmailLink changes the uid while Firestore listeners and
 * queued writes are still in flight, and rules reject them (DARK-LANG-J4).
 * Link the email onto the anonymous user instead, matching Google sign-in.
 * An email that already belongs to an account signs into that account.
 */
export const completeEmailLinkSignIn = async (
  auth: Auth,
  email: string,
  emailLink: string,
  deps: Partial<EmailLinkDeps> = {},
): Promise<UserCredential> => {
  const signIn = { ...defaultDeps, ...deps };
  await auth.authStateReady();

  const currentUser = auth.currentUser;
  if (!currentUser?.isAnonymous) {
    return signIn.signInWithEmailLink(auth, email, emailLink);
  }

  const credential = EmailAuthProvider.credentialWithLink(email, emailLink);
  try {
    return await signIn.linkWithCredential(currentUser, credential);
  } catch (error) {
    if (!isEmailCredentialAlreadyInUse(error)) throw error;
    return signIn.signInWithCredential(auth, credential);
  }
};
