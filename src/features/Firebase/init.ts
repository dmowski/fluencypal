'use client';

import { firebaseConfig } from '@/common/firebaseConfig';
import { connectToEmulator } from '@/libs/firebaseEmulator';
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const isNodeEnv = typeof window === 'undefined';
const isSafari = !isNodeEnv && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isFirebaseEmulator = process.env.NEXT_PUBLIC_IS_FIREBASE_EMULATOR === 'true';
const app = initializeApp(firebaseConfig);

// Connect to Firebase Emulator if enabled
if (isFirebaseEmulator) {
  connectToEmulator(app);
}

const firestore =
  isSafari || isNodeEnv
    ? getFirestore(app)
    : initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });

const auth =
  isSafari || isNodeEnv
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });

const storage = getStorage(app);
const functions = getFunctions(app);
//const isLocalhost = !isNodeEnv && window.location.hostname === "localhost";
//const analytics = !isNodeEnv && !isLocalhost ? getAnalytics(app) : null;

const setCookiesGDPR = (enabled: boolean) => {
  //if (!analytics) return;
  //setAnalyticsCollectionEnabled(analytics, enabled);
};

async function deleteCollectionDocs(collectionPath: string): Promise<void> {
  const snap = await getDocs(collection(firestore, collectionPath));
  const deletions = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletions);
}

export { auth, firestore, storage, setCookiesGDPR, deleteCollectionDocs, functions };
