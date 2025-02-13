"use client";

import { firebaseConfig } from "@/common/firebaseConfig";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const isNodeEnv = typeof window === "undefined";
const isSafari = !isNodeEnv && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isEmulator = `${process.env.REACT_APP_FIREBASE_EMULATOR || ""}` === "true";
const jestWorkerId = `${process.env.JEST_WORKER_ID || ""}`;

const isUnitTestsEnv = !!jestWorkerId;
const app = initializeApp(firebaseConfig);

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

const isLocalhost = isNodeEnv || window.location.hostname === "localhost";

if (isEmulator) {
  connectFirestoreEmulator(firestore, "localhost", 8080);
  connectAuthEmulator(auth, `http://localhost:9099`, { disableWarnings: true });
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
} else if (!isUnitTestsEnv && !isLocalhost) {
  getAnalytics(app);
  getPerformance(app);
}

export { auth, firestore, storage, functions };
