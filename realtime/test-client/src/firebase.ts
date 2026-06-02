import { FirebaseError, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  initializeAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithCredential,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { isInAppBrowser, shouldUseRedirectSignIn } from './authEnvironment.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD3bNY55votFEehrHs8dAlJuDCf6Chu2IQ',
  authDomain: 'dark-lang.firebaseapp.com',
  projectId: 'dark-lang',
  storageBucket: 'dark-lang.firebasestorage.app',
  messagingSenderId: '815064634206',
  appId: '1:815064634206:web:57e338ddfe5aa9698775cf',
};

const EMAIL_STORAGE_KEY = 'realtime-auth-email';

const app = initializeApp(firebaseConfig);

const isAlreadyInitialized = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const firebaseError = error as FirebaseError;
  return (
    firebaseError.code === 'auth/already-initialized' || error.message.includes('already')
  );
};

/** Required for redirect (mobile) and reliable popup flows — same as webApp Firebase init. */
const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error: unknown) {
    if (isAlreadyInitialized(error)) {
      return getAuth(app);
    }
    throw error;
  }
})();

let emulatorConnected = false;
let redirectResultPromise: Promise<User | null> | null = null;

export const configureAuthEmulator = (enabled: boolean): void => {
  if (enabled && !emulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    emulatorConnected = true;
    redirectResultPromise = null;
  }
};

export const isAuthEmulatorEnabled = (): boolean => emulatorConnected;

export const watchAuth = (onChange: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, onChange);
};

const cleanEmailLinkParams = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete('oobCode');
  url.searchParams.delete('mode');
  url.searchParams.delete('apiKey');
  url.searchParams.delete('continueUrl');
  url.searchParams.delete('lang');
  window.history.replaceState({}, document.title, url.toString());
};

export const formatAuthError = (error: unknown): Error => {
  if (error instanceof FirebaseError) {
    const hints: Record<string, string> = {
      'auth/unauthorized-domain':
        'This site is not in Firebase Authorized domains. Add this hostname in Firebase Console → Authentication → Settings.',
      'auth/operation-not-supported-in-this-environment':
        'Google sign-in is not supported in this browser. Open in Safari or Chrome, or use email sign-in.',
      'auth/popup-blocked':
        'Popup was blocked. Try again or use email sign-in.',
      'auth/network-request-failed': 'Network error. Check your connection and try again.',
    };

    const hint = hints[error.code];
    return new Error(hint ?? error.message);
  }

  return error instanceof Error ? error : new Error('Authentication failed');
};

/** Finish redirect OAuth when the page loads after Google (mobile / Safari). */
export const completeRedirectSignIn = async (): Promise<User | null> => {
  if (emulatorConnected) {
    return auth.currentUser;
  }

  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth)
      .then((result) => result?.user ?? null)
      .catch((error) => {
        redirectResultPromise = null;
        throw formatAuthError(error);
      });
  }

  return redirectResultPromise;
};

/** Finish email magic-link sign-in when the user opens the link. */
export const completeEmailLinkSignIn = async (): Promise<User | null> => {
  if (emulatorConnected || !isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  const email = window.localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!email) {
    cleanEmailLinkParams();
    throw new Error('Open the sign-in link on the same device where you requested the email.');
  }

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    cleanEmailLinkParams();
    return result.user;
  } catch (error) {
    cleanEmailLinkParams();
    throw formatAuthError(error);
  }
};

export const waitForAuthBootstrap = async (): Promise<User | null> => {
  const emailUser = await completeEmailLinkSignIn();
  if (emailUser) {
    return emailUser;
  }

  return completeRedirectSignIn();
};

export const sendEmailSignInLink = async (email: string): Promise<void> => {
  if (emulatorConnected) {
    throw new Error('Email sign-in is not available with the Auth emulator enabled.');
  }

  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error('Enter your email address.');
  }

  await sendSignInLinkToEmail(auth, trimmed, {
    url: `${window.location.origin}${window.location.pathname}`,
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
};

const signInWithGoogleEmulator = async (): Promise<User> => {
  const email = `realtime-dev-${Date.now()}@example.com`;
  const credential = GoogleAuthProvider.credential(
    JSON.stringify({
      sub: `google-${Date.now()}`,
      email,
      email_verified: true,
      name: 'Realtime Dev User',
    }),
  );
  const result = await signInWithCredential(auth, credential);
  return result.user;
};

const shouldFallbackPopupToRedirect = (error: FirebaseError): boolean =>
  error.code === 'auth/popup-blocked' ||
  error.code === 'auth/operation-not-supported-in-this-environment' ||
  error.code === 'auth/cancelled-popup-request';

export const signInWithGoogle = async (): Promise<User> => {
  if (emulatorConnected) {
    return signInWithGoogleEmulator();
  }

  if (isInAppBrowser()) {
    throw new Error(
      'Google sign-in is not supported in this browser. Open in Safari or Chrome, or use email sign-in.',
    );
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  if (shouldUseRedirectSignIn()) {
    await signInWithRedirect(auth, provider);
    throw new Error('Redirecting to Google sign-in…');
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (error instanceof FirebaseError && shouldFallbackPopupToRedirect(error)) {
      await signInWithRedirect(auth, provider);
      throw new Error('Redirecting to Google sign-in…');
    }

    throw formatAuthError(error);
  }
};

export const signOutUser = (): Promise<void> => signOut(auth);

export const getIdToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sign in first');
  }

  return user.getIdToken();
};
