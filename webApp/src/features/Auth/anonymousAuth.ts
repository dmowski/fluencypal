import { Auth, isSignInWithEmailLink, signInAnonymously } from 'firebase/auth';
import { completeGoogleRedirectSignIn } from './googleSignIn';

let inFlight: Promise<string> | null = null;

export const shouldDeferAnonymousAuth = (firebaseAuth: Auth): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return isSignInWithEmailLink(firebaseAuth, window.location.href);
};

/**
 * Ensure there is a Firebase user for guest flows.
 * Finishes a Google redirect before creating an anonymous session. A new
 * anonymous user started in parallel clears the redirect, so iOS returns to
 * the same screen still signed out. Then waits for persistence so a restored
 * signed-in user is not overwritten. Email-link URLs are left alone.
 */
export const ensureAnonymousAuth = async (firebaseAuth: Auth): Promise<string> => {
  await completeGoogleRedirectSignIn(firebaseAuth);
  await firebaseAuth.authStateReady();

  const existing = firebaseAuth.currentUser;
  if (existing) {
    return existing.uid;
  }

  if (shouldDeferAnonymousAuth(firebaseAuth)) {
    return '';
  }

  if (!inFlight) {
    inFlight = signInAnonymously(firebaseAuth)
      .then(async (credential) => {
        await credential.user.getIdToken();
        return credential.user.uid;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};
