import firebaseAdmin from "firebase-admin";

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

let cacheApp: firebaseAdmin.app.App | null = null;

const initApp = (): firebaseAdmin.app.App => {
  let fApp = firebaseAdmin.apps[0];
  if (fApp) {
    return fApp;
  }

  if (cacheApp) {
    return cacheApp;
  }

  const appOptions: firebaseAdmin.AppOptions = {
    credential: firebaseAdmin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    storageBucket: storageBucket,
  };

  const app = firebaseAdmin.initializeApp(appOptions, projectId + Date.now());

  cacheApp = app;

  return app;
};

export const getBucket = () => {
  let app = firebaseAdmin.apps[0];
  if (app) {
    return app.storage().bucket(storageBucket);
  }

  app = initApp();

  return app.storage().bucket(storageBucket);
};

export const getDB = () => {
  let app = firebaseAdmin.apps[0];
  if (app) {
    return app.firestore();
  }

  app = initApp();

  return app.firestore();
};
