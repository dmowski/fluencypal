"use client";

import { firebaseConfig } from "@/common/firebaseConfig";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const isEmulator = `${process.env.REACT_APP_FIREBASE_EMULATOR || ""}` === "true";
const jestWorkerId = `${process.env.JEST_WORKER_ID || ""}`;

const isUnitTestsEnv = !!jestWorkerId;
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const isNodeEnv = typeof window === "undefined";
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
