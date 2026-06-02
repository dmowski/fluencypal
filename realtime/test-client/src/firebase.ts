import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD3bNY55votFEehrHs8dAlJuDCf6Chu2IQ',
  authDomain: 'dark-lang.firebaseapp.com',
  projectId: 'dark-lang',
  storageBucket: 'dark-lang.firebasestorage.app',
  messagingSenderId: '815064634206',
  appId: '1:815064634206:web:57e338ddfe5aa9698775cf',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let emulatorConnected = false;

export const configureAuthEmulator = (enabled: boolean): void => {
  if (enabled && !emulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    emulatorConnected = true;
  }
};

export const isAuthEmulatorEnabled = (): boolean => emulatorConnected;

export const watchAuth = (onChange: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, onChange);
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

export const signInWithGoogle = async (): Promise<User> => {
  if (emulatorConnected) {
    return signInWithGoogleEmulator();
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const signOutUser = (): Promise<void> => signOut(auth);

export const getIdToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sign in first');
  }

  return user.getIdToken();
};
