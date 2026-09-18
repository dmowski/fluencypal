import { Auth, isSignInWithEmailLink, signInAnonymously } from 'firebase/auth';

let inFlight: Promise<string> | null = null;

export const shouldDeferAnonymousAuth = (firebaseAuth: Auth): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return isSignInWithEmailLink(firebaseAuth, window.location.href);
};

/**
 * Ensure there is a Firebase user for guest flows.
 * Waits for auth persistence to restore before creating an anonymous session,
 * so a signed-in reload is not overwritten by a premature anonymous sign-in.
 * Email-link URLs are left alone until that sign-in finishes.
 */
export const ensureAnonymousAuth = async (firebaseAuth: Auth): Promise<string> => {
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
