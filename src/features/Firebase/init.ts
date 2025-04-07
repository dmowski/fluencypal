"use client";

import { firebaseConfig } from "@/common/firebaseConfig";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const isNodeEnv = typeof window === "undefined";
const isSafari = !isNodeEnv && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
console.log("FIREBASE!!!");
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
//const isLocalhost = !isNodeEnv && window.location.hostname === "localhost";
//const analytics = !isNodeEnv && !isLocalhost ? getAnalytics(app) : null;

const setCookiesGDPR = (enabled: boolean) => {
  //if (!analytics) return;
  //setAnalyticsCollectionEnabled(analytics, enabled);
};

export { auth, firestore, storage, setCookiesGDPR, functions };
