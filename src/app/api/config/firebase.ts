import { firebaseConfig } from "@/common/firebaseConfig";
import firebaseAdmin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS as string);

const initApp = () => {
  return firebaseAdmin.initializeApp(
    {
      credential: firebaseAdmin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      }),
      storageBucket: firebaseConfig.storageBucket,
    },
    firebaseConfig.projectId + Date.now()
  );
};

const getBucket = () => {
  let app = firebaseAdmin.apps[0];
  if (app) {
    return app.storage().bucket(firebaseConfig.storageBucket);
  }

  app = initApp();

  return app.storage().bucket(firebaseConfig.storageBucket);
};

const getDB = () => {
  let app = firebaseAdmin.apps[0];
  if (app) {
    return app.firestore();
  }

  app = initApp();

  return app.firestore();
};

export { getBucket, firebaseConfig, getDB };
