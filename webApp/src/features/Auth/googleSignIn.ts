import { FirebaseError } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  getRedirectResult,
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

type GoogleSignInDeps = {
  signInWithPopup: typeof signInWithPopup;
  signInWithRedirect: typeof signInWithRedirect;
};

const defaultDeps: GoogleSignInDeps = {
  signInWithPopup,
  signInWithRedirect,
};

export const signInWithGoogleAccount = async (
  auth: Auth,
  env: GoogleSignInEnv = resolveGoogleSignInEnv(),
  deps: GoogleSignInDeps = defaultDeps,
): Promise<SignInResult> => {
  if (env.isWebView) {
    return {
      isDone: false,
      error:
        'Google sign-in is not supported in this browser. Please open in Chrome or use email sign-in.',
    };
  }

  const provider = new GoogleAuthProvider();

  if (!env.isEmulator && env.shouldRedirect) {
    await deps.signInWithRedirect(auth, provider);
    return { isDone: false, error: '', isRedirecting: true };
  }

  try {
    await deps.signInWithPopup(auth, provider);
    return { isDone: true, error: '' };
  } catch (error) {
    if (!env.isEmulator && shouldFallbackPopupToRedirect(error)) {
      await deps.signInWithRedirect(auth, provider);
      return { isDone: false, error: '', isRedirecting: true };
    }

    const message = getGoogleSignInErrorMessage(error);
    if (message) {
      console.error('Google sign in error', error);
    }
    return {
      isDone: false,
      error: message || '',
    };
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
