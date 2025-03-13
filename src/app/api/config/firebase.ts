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

const validateAuthToken = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Authorization header is required");
  }
  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const app = initApp();
    const decodedToken = await app.auth().verifyIdToken(token);

    const { uid, email } = decodedToken;

    return { uid, email };
  } catch (error) {
    console.error("Error validating token", error);
    throw new Error("Invalid token");
  }
};

export { getBucket, firebaseConfig, getDB, validateAuthToken };
