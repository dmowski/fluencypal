'use client';
import {
  signInWithCustomToken as firebaseSignInWithCustomToken,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings,
} from 'firebase/auth';
import { ensureAnonymousAuth } from './anonymousAuth';
import { isIdentifiedAuthUser } from './identifiedAuth';
import {
  Context,
  JSX,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../Firebase/init';
import * as Sentry from '@sentry/nextjs';
import { FirebaseError } from 'firebase/app';
import { acceptAnalytics } from '../Analytics/initGTag';
import { sendTelegramRequest } from '../Telegram/sendTextAiRequest';
import {
  completeGoogleRedirectSignIn,
  getGoogleSignInErrorMessage,
  signInWithGoogleAccount,
  SignInResult,
} from './googleSignIn';
import { sendAuthAttempt, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';

export interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthContext {
  loading: boolean;
  uid: string;
  userInfo: UserInfo | null;
  isAuthorized: boolean;
  isAnonymous: boolean;
  isIdentified: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<SignInResult>;
  signInWithCustomToken: (backendToken: string) => Promise<SignInResult>;
  ensureAnonymousAuth: () => Promise<string>;
  getToken: (forceRefresh?: boolean) => Promise<string>;

  signInWithEmail: (email: string) => Promise<SignInResult>;
  isDev: boolean;
  isFounder: boolean;
  sendTgMessage: (message: string) => Promise<void>;
}

const LOCALSTORAGE_EMAIL_KEY = 'emailForSignIn';

export const authContext: Context<AuthContext> = createContext<AuthContext>({
  loading: true,
  uid: '',
  isAuthorized: false,
  isAnonymous: false,
  isIdentified: false,
  userInfo: null,
  logout: async () => void 0,
  signInWithGoogle: async () => {
    throw new Error('signInWithGoogle not implemented');
  },
  signInWithCustomToken: async () => {
    throw new Error('signInWithCustomToken not implemented');
  },
  ensureAnonymousAuth: async () => '',
  getToken: async () => '',
  signInWithEmail: async () => {
    throw new Error('signInWithEmail not implemented');
  },
  isDev: false,
  isFounder: false,
  sendTgMessage: async () => void 0,
});

function useProvideAuth(): AuthContext {
  const [userInfo, loading, errorAuth] = useAuthState(auth);
  const googleSignInInProgress = useRef(false);

  const signInWithGoogle = async (): Promise<SignInResult> => {
    if (googleSignInInProgress.current) {
      return { isDone: false, error: '' };
    }

    googleSignInInProgress.current = true;
    sendAuthAttempt({ provider: 'google', result: 'opened' });
    try {
      const result = await signInWithGoogleAccount(auth);
      if (!result.isRedirecting) {
        googleSignInInProgress.current = false;
      }
      if (result.isDone) {
        sendAuthAttempt({ provider: 'google', result: 'success' });
      } else if (result.isRedirecting) {
        // Keep "opened"; success lands after redirect.
      } else if (result.error) {
        sendAuthAttempt({ provider: 'google', result: 'error' });
        sendUiError('auth_google_error');
      } else {
        sendAuthAttempt({ provider: 'google', result: 'cancelled' });
      }
      return result;
    } catch (error) {
      googleSignInInProgress.current = false;
      const message = getGoogleSignInErrorMessage(error);
      if (message) {
        console.error('Google sign in error', error);
        sendAuthAttempt({ provider: 'google', result: 'error' });
        sendUiError('auth_google_error');
      } else {
        sendAuthAttempt({ provider: 'google', result: 'cancelled' });
      }
      return { isDone: false, error: message || '' };
    }
  };

  const cleanEmailSignInUrl = (): void => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('oobCode');
    url.searchParams.delete('mode');
    url.searchParams.delete('apiKey');
    url.searchParams.delete('continueUrl');
    url.searchParams.delete('lang');
    window.history.replaceState({}, document.title, url.toString());
  };

  const confirmEmailLinkSignIn = async (): Promise<void> => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    const email = window.localStorage.getItem(LOCALSTORAGE_EMAIL_KEY);
    if (!email) {
      cleanEmailSignInUrl();
      return;
    }

    try {
      const credential = await signInWithEmailLink(auth, email, window.location.href);
      await credential.user.getIdToken(true);
      window.localStorage.removeItem(LOCALSTORAGE_EMAIL_KEY);
      cleanEmailSignInUrl();
    } catch (error) {
      window.localStorage.removeItem(LOCALSTORAGE_EMAIL_KEY);
      cleanEmailSignInUrl();

      const code = error instanceof FirebaseError ? error.code : '';
      if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
        alert('This sign-in link is invalid or has expired. Please request a new one.');
        console.warn('Email link sign-in failed', code);
        return;
      }

      alert('Failed to sign in with email link. Please try again.');
      console.error('Error confirming email link sign-in', error);
      Sentry.captureException(error);
    }
  };

  useEffect(() => {
    void (async () => {
      await confirmEmailLinkSignIn();
      try {
        await ensureAnonymousAuth(auth);
      } catch (error) {
        Sentry.captureException(error);
      }
    })();
    void (async () => {
      try {
        const redirected = await completeGoogleRedirectSignIn(auth);
        if (redirected) sendAuthAttempt({ provider: 'google', result: 'success' });
      } catch (error) {
        const isNetworkFailure =
          error instanceof FirebaseError && error.code === 'auth/network-request-failed';
        if (isNetworkFailure) {
          console.warn('Google redirect sign-in network error', error);
          return;
        }
        console.error('Google redirect sign-in error', error);
        Sentry.captureException(error);
      }
    })();
  }, []);

  const signInWithEmail = async (email: string): Promise<SignInResult> => {
    const url = window.location.href;
    const actionCodeSettings: ActionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: url,
      // This must be true.
      handleCodeInApp: true,
      linkDomain: 'fluencypal.com',
    };

    try {
      console.log('actionCodeSettings', actionCodeSettings);
      sendAuthAttempt({ provider: 'email', result: 'opened' });
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(LOCALSTORAGE_EMAIL_KEY, email);
      sendAuthAttempt({ provider: 'email', result: 'success' });
      return { isDone: true, error: '' };
    } catch (error: any) {
      const errorCode = error.code;
      console.error('Email sign in error', error);
      sendAuthAttempt({ provider: 'email', result: 'error' });
      sendUiError('auth_email_error');
      if (errorCode === 'auth/invalid-email') {
        return { isDone: false, error: 'The email address is not valid.' };
      } else if (
        errorCode === 'auth/missing-android-pkg-name' ||
        errorCode === 'auth/missing-continue-uri' ||
        errorCode === 'auth/missing-ios-bundle-id' ||
        errorCode === 'auth/invalid-continue-uri' ||
        errorCode === 'auth/unauthorized-continue-uri'
      ) {
        return {
          isDone: false,
          error: 'There is an issue with the sign-in link configuration.',
        };
      } else {
        return {
          isDone: false,
          error: 'Failed to send sign-in email. Please try again.',
        };
      }
    }
  };

  const signInWithCustomToken = async (backendToken: string): Promise<SignInResult> => {
    try {
      if (!backendToken || typeof backendToken !== 'string') {
        return { isDone: false, error: 'No token provided' };
      }

      // If already signed in, Firebase will switch the user if token UID differs.
      const credentialUser = await firebaseSignInWithCustomToken(auth, backendToken);

      console.log('credentialUser', credentialUser);

      // Ensure an ID token is minted right away so getToken() works immediately.
      await credentialUser.user.getIdToken(true);

      return { isDone: true, error: '' };
    } catch (error: any) {
      let message = 'Custom token sign-in failed. Please try again.';

      if (error?.code) {
        // Map common Firebase Auth errors to clearer messages
        switch (error.code as string) {
          case 'auth/invalid-custom-token':
            message = 'Invalid custom token.';
            break;
          case 'auth/custom-token-mismatch':
            message = 'The custom token is for a different Firebase project.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error during sign-in.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many requests. Please wait and try again.';
            break;
          case 'auth/internal-error':
            message = 'Internal auth error. Please retry.';
            break;
          default:
            message = error.message || message;
        }
      } else if (error?.message) {
        message = error.message;
      }

      console.error('signInWithCustomToken error:', error);
      return { isDone: false, error: message };
    }
  };

  const isAuthorized = !!userInfo?.uid && !errorAuth;
  const isAnonymous = Boolean(userInfo?.isAnonymous);
  const isIdentified = isIdentifiedAuthUser(userInfo) && !errorAuth;

  const isDev = userInfo?.email?.includes('dmowski') || false;

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    Sentry.setUser({
      id: userInfo.uid,
      email: userInfo?.email || '',
    });

    if (!isDev) {
      acceptAnalytics();
    }
  }, [userInfo]);

  const logout = async (): Promise<void> => {
    await auth.signOut();
  };

  const getToken = async (forceRefresh = false) => {
    const token = await userInfo?.getIdToken(forceRefresh);
    return token || '';
  };

  const userId = userInfo?.uid || '';
  const isFounder = userId === 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';
  const ensureAnonymousUser = useCallback(() => ensureAnonymousAuth(auth), []);

  const sendTgMessage = async (message: string) => {
    await sendTelegramRequest(
      {
        message,
      },
      await getToken(),
    );
  };

  return {
    isAuthorized,
    isAnonymous,
    isIdentified,
    loading,

    signInWithGoogle,
    signInWithCustomToken,
    ensureAnonymousAuth: ensureAnonymousUser,

    userInfo: userInfo || null,
    uid: userId,

    logout,
    getToken,
    signInWithEmail,

    isDev,
    isFounder,
    sendTgMessage,
  };
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{props.children}</authContext.Provider>;
}

export const useAuth = (): AuthContext => useContext(authContext);
