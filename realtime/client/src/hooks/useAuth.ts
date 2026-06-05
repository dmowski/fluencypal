import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { isInAppBrowser, shouldUseRedirectSignIn } from '../lib/authEnvironment.js';
import {
  auth,
  completeEmailLinkSignIn,
  completeRedirectSignIn,
  configureAuthEmulator,
  sendEmailSignInLink,
  signInWithGoogle,
  signOutUser,
} from '../lib/firebase.js';
import { isLocalDev, shouldDefaultEmulator } from '../lib/env.js';
import { debugLog } from '../lib/debugLog.js';

export type AuthStatusTone = 'idle' | 'ok' | 'active' | 'warning' | 'error';

export const useAuth = () => {
  const [user, loading, errorAuth] = useAuthState(auth);
  const [useEmulator, setUseEmulator] = useState(shouldDefaultEmulator);
  const [signInGoogleDisabled, setSignInGoogleDisabled] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailHint, setEmailHint] = useState('');
  const [emailHintIsError, setEmailHintIsError] = useState(false);
  const [sendEmailDisabled, setSendEmailDisabled] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const signedIn = Boolean(user?.uid) && !errorAuth;

  const authStatusText = useMemo(() => {
    if (loading) {
      return 'Checking sign-in…';
    }
    if (signInError) {
      return signInError;
    }
    if (errorAuth) {
      return errorAuth.message;
    }
    return user ? `Signed in · ${user.email ?? user.uid}` : 'Not signed in';
  }, [errorAuth, loading, signInError, user]);

  const authStatusTone = useMemo((): AuthStatusTone => {
    if (loading || signInError?.includes('Redirecting')) {
      return 'warning';
    }
    if (errorAuth || signInError) {
      return 'error';
    }
    return user ? 'ok' : 'idle';
  }, [errorAuth, loading, signInError, user]);

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
    void (async () => {
      try {
        await completeEmailLinkSignIn();
        await completeRedirectSignIn();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign-in failed';
        setSignInError(message);
        debugLog('auth', 'bootstrap_error', { message });
      }
    })();
  }, []);

  const handleSignInGoogle = useCallback(async () => {
    configureAuthEmulator(useEmulator);
    setSignInGoogleDisabled(true);
    setSignInError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Redirecting')) {
        setSignInError('Redirecting to Google…');
        return;
      }

      setSignInError(error instanceof Error ? error.message : 'Google sign in failed');
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
    user: user ?? null,
    signedIn,
    loading,
    authStatusText,
    authStatusTone,
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
