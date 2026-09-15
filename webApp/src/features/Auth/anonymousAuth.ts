import { Auth, signInAnonymously } from 'firebase/auth';

let inFlight: Promise<string> | null = null;

export const ensureAnonymousAuth = async (firebaseAuth: Auth): Promise<string> => {
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
