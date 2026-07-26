import { App, AppOptions, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const storageBucket = "dark-lang.firebasestorage.app";
const projectId = "dark-lang";

const rawServiceAccount = process.env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS;
const serviceAccount = (() => {
  if (!rawServiceAccount) {
    throw new Error("FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS is required");
  }
  const parsed = JSON.parse(rawServiceAccount);
  return {
    ...parsed,
    private_key: (parsed.private_key as string | undefined)?.replace(/\\n/g, "\n") ?? "",
  };
})();

let cacheApp: App | null = null;

const initApp = (): App => {
  const existingApps = getApps();
  const fApp = existingApps[0];
  if (fApp) {
    return fApp;
  }

  if (cacheApp) {
    return cacheApp;
  }

  const appOptions: AppOptions = {
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    storageBucket: storageBucket,
  };

  const app = initializeApp(appOptions, projectId + Date.now());

  cacheApp = app;

  return app;
};

export const getBucket = () => {
  const existingApps = getApps();
  const app = existingApps[0] ?? initApp();
  return getStorage(app).bucket(storageBucket);
};

export const getDB = () => {
  const existingApps = getApps();
  const app = existingApps[0] ?? initApp();
  return getFirestore(app);
};
