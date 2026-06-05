import { useCallback, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { isInAppBrowser, shouldUseRedirectSignIn } from '../lib/authEnvironment.js';
import {
  configureAuthEmulator,
  sendEmailSignInLink,
  signInWithGoogle,
  signOutUser,
  waitForAuthBootstrap,
  watchAuth,
} from '../lib/firebase.js';
import { isLocalDev, shouldDefaultEmulator } from '../lib/env.js';
import { debugLog } from '../lib/debugLog.js';

export type AuthStatusTone = 'idle' | 'ok' | 'active' | 'warning' | 'error';

export type AuthState = {
  user: User | null;
  signedIn: boolean;
  authStatusText: string;
  authStatusTone: AuthStatusTone;
  authChecking: boolean;
  useEmulator: boolean;
  signInGoogleDisabled: boolean;
  showEmailForm: boolean;
  emailHint: string;
  emailHintIsError: boolean;
  authBrowserWarning: string | null;
  authHint: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatusText, setAuthStatusText] = useState('Not signed in');
  const [authStatusTone, setAuthStatusTone] = useState<AuthStatusTone>('idle');
  const [authChecking, setAuthChecking] = useState(true);
  const [useEmulator, setUseEmulator] = useState(shouldDefaultEmulator);
  const [signInGoogleDisabled, setSignInGoogleDisabled] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailHint, setEmailHint] = useState('');
  const [emailHintIsError, setEmailHintIsError] = useState(false);
  const [sendEmailDisabled, setSendEmailDisabled] = useState(false);

  const authHint = isLocalDev()
    ? 'Optional: enable the emulator for instant fake sign-in, or sign in with real Google.'
    : 'Sign in with Google (redirect on mobile) or email link if Google is blocked.';

  const authBrowserWarning = (() => {
    if (isInAppBrowser()) {
      return 'You are in an in-app browser (e.g. Instagram or Telegram). Google sign-in usually fails here — open this page in Safari or Chrome, or use email sign-in.';
    }
    if (shouldUseRedirectSignIn()) {
      return 'Mobile browser detected — Google will open in a full-page redirect.';
    }
    return null;
  })();

  useEffect(() => {
    configureAuthEmulator(useEmulator);
  }, [useEmulator]);

  useEffect(() => {
    setAuthStatusText('Checking sign-in…');
    setAuthStatusTone('warning');

    void (async () => {
      try {
        const bootstrapUser = await waitForAuthBootstrap();
        if (bootstrapUser) {
          debugLog('auth', 'bootstrap_sign_in_complete', {
            email: bootstrapUser.email ?? bootstrapUser.uid,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign-in failed';
        setAuthStatusText(message);
        setAuthStatusTone('error');
        debugLog('auth', 'bootstrap_error', { message });
      } finally {
        setSignInGoogleDisabled(false);
        setAuthChecking(false);
      }
    })();

    return watchAuth((nextUser) => {
      setUser(nextUser);
      setAuthStatusText(
        nextUser ? `Signed in · ${nextUser.email ?? nextUser.uid}` : 'Not signed in',
      );
      setAuthStatusTone(nextUser ? 'ok' : 'idle');
    });
  }, []);

  const handleSignInGoogle = useCallback(async () => {
    configureAuthEmulator(useEmulator);
    setSignInGoogleDisabled(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Redirecting')) {
        setAuthStatusText('Redirecting to Google…');
        setAuthStatusTone('warning');
        return;
      }

      setAuthStatusText(error instanceof Error ? error.message : 'Google sign in failed');
      setAuthStatusTone('error');
      setSignInGoogleDisabled(false);
    } finally {
      if (!shouldUseRedirectSignIn() || useEmulator) {
        setSignInGoogleDisabled(false);
      }
    }
  }, [useEmulator]);

  const handleSendEmailLink = useCallback(async (email: string) => {
    configureAuthEmulator(useEmulator);
    setSendEmailDisabled(true);
    setEmailHint('');
    setEmailHintIsError(false);

    try {
      await sendEmailSignInLink(email);
      setEmailHint('Check your email and open the link on this device.');
      debugLog('auth', 'email_link_sent');
    } catch (error) {
      setEmailHint(error instanceof Error ? error.message : 'Failed to send email');
      setEmailHintIsError(true);
    } finally {
      setSendEmailDisabled(false);
    }
  }, [useEmulator]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
  }, []);

  return {
    user,
    signedIn: Boolean(user),
    authStatusText,
    authStatusTone,
    authChecking,
    useEmulator,
    setUseEmulator,
    signInGoogleDisabled,
    showEmailForm,
    setShowEmailForm,
    emailHint,
    emailHintIsError,
    sendEmailDisabled,
    authBrowserWarning,
    authHint,
    handleSignInGoogle,
    handleSendEmailLink,
    handleSignOut,
  };
};
