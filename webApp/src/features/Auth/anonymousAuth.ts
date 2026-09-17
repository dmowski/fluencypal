import { Auth, signInAnonymously } from 'firebase/auth';

let inFlight: Promise<string> | null = null;

/**
 * Ensure there is a Firebase user for guest flows.
 * Waits for auth persistence to restore before creating an anonymous session,
 * so a signed-in reload is not overwritten by a premature anonymous sign-in.
 */
export const ensureAnonymousAuth = async (firebaseAuth: Auth): Promise<string> => {
  await firebaseAuth.authStateReady();

  const existing = firebaseAuth.currentUser;
  if (existing) {
    return existing.uid;
  }

  if (!inFlight) {
    inFlight = signInAnonymously(firebaseAuth)
      .then((credential) => credential.user.uid)
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};
