import { FirebaseError } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  UserCredential,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { shouldUseRedirectSignIn } from './googleSignInEnvironment';
import { shouldShowWebViewWall } from './useIsWebView';

export interface SignInResult {
  isDone: boolean;
  error: string;
  isRedirecting?: boolean;
}

export const isFirebaseAuthPendingPromiseError = (reason: unknown): boolean => {
  const message =
    typeof reason === 'string'
      ? reason
      : reason instanceof Error
        ? reason.message
        : reason && typeof reason === 'object' && 'message' in reason
          ? String(reason.message)
          : '';

  return message.includes('Pending promise was never set');
};

export const getGoogleSignInErrorMessage = (error: unknown): string | null => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return null;
      case 'auth/popup-blocked':
        return 'Google sign-in popup was blocked. Please allow popups or use email sign-in.';
      case 'auth/operation-not-supported-in-this-environment':
        return 'Google sign-in is not supported in this browser. Please use email sign-in.';
      case 'auth/network-request-failed':
        return 'Network error during Google sign-in. Please check your connection and try again.';
      default:
        break;
    }
  }

  if (isFirebaseAuthPendingPromiseError(error)) {
    return 'Google sign-in is not supported in this browser. Please use email sign-in.';
  }

  return 'Google sign-in was unsuccessful. Please try again.';
};

export const shouldFallbackPopupToRedirect = (error: unknown): boolean => {
  if (error instanceof FirebaseError) {
    return (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/operation-not-supported-in-this-environment'
    );
  }

  return isFirebaseAuthPendingPromiseError(error);
};

export type GoogleSignInEnv = {
  isEmulator: boolean;
  isWebView: boolean;
  shouldRedirect: boolean;
};

export const resolveGoogleSignInEnv = (): GoogleSignInEnv => ({
  isEmulator: process.env.NEXT_PUBLIC_IS_FIREBASE_EMULATOR === 'true',
  isWebView: shouldShowWebViewWall(),
  shouldRedirect: shouldUseRedirectSignIn(),
});

const isGoogleCredentialAlreadyInUse = (error: unknown): boolean =>
  error instanceof FirebaseError &&
  (error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use');

type GoogleSignInDeps = {
  signInWithPopup: typeof signInWithPopup;
  signInWithRedirect: typeof signInWithRedirect;
  linkWithPopup: typeof linkWithPopup;
  linkWithRedirect: typeof linkWithRedirect;
  signInWithCredential: typeof signInWithCredential;
};

const defaultDeps: GoogleSignInDeps = {
  signInWithPopup,
  signInWithRedirect,
  linkWithPopup,
  linkWithRedirect,
  signInWithCredential,
};

const signInOrLinkGoogle = async (
  auth: Auth,
  provider: GoogleAuthProvider,
  currentUser: User | null,
  deps: GoogleSignInDeps,
): Promise<void> => {
  if (!currentUser?.isAnonymous) {
    await deps.signInWithPopup(auth, provider);
    return;
  }

  try {
    await deps.linkWithPopup(currentUser, provider);
  } catch (error) {
    if (!isGoogleCredentialAlreadyInUse(error)) {
      throw error;
    }
    const credential = GoogleAuthProvider.credentialFromError(error as FirebaseError);
    if (!credential) {
      throw error;
    }
    await deps.signInWithCredential(auth, credential);
  }
};

const startGoogleRedirect = async (
  auth: Auth,
  provider: GoogleAuthProvider,
  currentUser: User | null,
  deps: GoogleSignInDeps,
): Promise<void> => {
  if (currentUser?.isAnonymous) {
    await deps.linkWithRedirect(currentUser, provider);
    return;
  }
  await deps.signInWithRedirect(auth, provider);
};

const toGoogleSignInFailure = (error: unknown): SignInResult => {
  const message = getGoogleSignInErrorMessage(error);
  if (message) {
    console.error('Google sign in error', error);
  }
  return {
    isDone: false,
    error: message || '',
  };
};

export const signInWithGoogleAccount = async (
  auth: Auth,
  env: GoogleSignInEnv = resolveGoogleSignInEnv(),
  deps: Partial<GoogleSignInDeps> = {},
): Promise<SignInResult> => {
  const signInDeps: GoogleSignInDeps = { ...defaultDeps, ...deps };
  if (env.isWebView) {
    return {
      isDone: false,
      error:
        'Google sign-in is not supported in this browser. Please open in Chrome or use email sign-in.',
    };
  }

  const provider = new GoogleAuthProvider();
  const currentUser = auth.currentUser;

  try {
    if (!env.isEmulator && env.shouldRedirect) {
      await startGoogleRedirect(auth, provider, currentUser, signInDeps);
      return { isDone: false, error: '', isRedirecting: true };
    }

    await signInOrLinkGoogle(auth, provider, currentUser, signInDeps);
    return { isDone: true, error: '' };
  } catch (error) {
    if (!env.isEmulator && !env.shouldRedirect && shouldFallbackPopupToRedirect(error)) {
      try {
        await startGoogleRedirect(auth, provider, auth.currentUser, signInDeps);
        return { isDone: false, error: '', isRedirecting: true };
      } catch (redirectError) {
        return toGoogleSignInFailure(redirectError);
      }
    }

    return toGoogleSignInFailure(error);
  }
};

let redirectResultPromise: Promise<UserCredential | null> | null = null;

export const completeGoogleRedirectSignIn = async (auth: Auth): Promise<UserCredential | null> => {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_IS_FIREBASE_EMULATOR === 'true') {
    return null;
  }

  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth).catch((error: unknown) => {
      redirectResultPromise = null;
      if (getGoogleSignInErrorMessage(error) === null || isFirebaseAuthPendingPromiseError(error)) {
        return null;
      }
      throw error;
    });
  }

  return redirectResultPromise;
};

let pendingPromiseGuardInstalled = false;

export const installFirebaseAuthPendingPromiseGuard = (): void => {
  if (typeof window === 'undefined' || pendingPromiseGuardInstalled) {
    return;
  }

  pendingPromiseGuardInstalled = true;
  window.addEventListener('unhandledrejection', (event) => {
    if (isFirebaseAuthPendingPromiseError(event.reason)) {
      event.preventDefault();
    }
  });
};
