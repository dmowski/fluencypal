import { firebaseConfig } from '@/common/firebaseConfig';
import firebaseAdmin from 'firebase-admin';
import { AuthUserInfo } from './type';

const isFirebaseEmulator = process.env.IS_FIREBASE_EMULATOR === 'true';

// Set emulator environment variables if enabled
if (isFirebaseEmulator) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}

const rawServiceAccount = process.env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS;
const serviceAccount = isFirebaseEmulator
  ? {
      project_id: 'dark-lang',
      client_email: 'emulator@example.com',
      private_key: '',
    }
  : (() => {
      if (!rawServiceAccount) {
        throw new Error('FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS is required');
      }
      const parsed = JSON.parse(rawServiceAccount);
      return {
        ...parsed,
        private_key: (parsed.private_key as string | undefined)?.replace(/\\n/g, '\n') ?? '',
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

  const appOptions: firebaseAdmin.AppOptions = isFirebaseEmulator
    ? {
        projectId: serviceAccount.project_id,
        storageBucket: firebaseConfig.storageBucket,
      }
    : {
        credential: firebaseAdmin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
        storageBucket: firebaseConfig.storageBucket,
      };

  const app = firebaseAdmin.initializeApp(appOptions, firebaseConfig.projectId + Date.now());

  cacheApp = app;

  return app;
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

const validateAuthToken = async (req: Request): Promise<AuthUserInfo> => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }
  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const app = initApp();
    const decodedToken = await app.auth().verifyIdToken(token);

    const { uid, email } = decodedToken;

    return { uid, email: email || '' };
  } catch (error) {
    console.error('Error validating token', error);
    throw new Error('Invalid token');
  }
};

const getAuth = () => initApp().auth();

export type UserInfo = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  disabled?: boolean;
};

const getAuthUser = async (userId: string): Promise<UserInfo | null> => {
  try {
    const userRecord = await getAuth().getUser(userId);
    return {
      uid: userRecord.uid,
      displayName: userRecord.displayName,
      email: userRecord.email,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
    };
  } catch (error) {
    console.error('Error fetching user', error);
    return null;
  }
};

const updateAuthUser = async (userId: string, userInfo: Partial<UserInfo>): Promise<UserInfo> => {
  const updated = await getAuth().updateUser(userId, {
    displayName: userInfo.displayName ?? undefined,
    email: userInfo.email ?? undefined,
    phoneNumber: userInfo.phoneNumber ?? undefined,
    photoURL: userInfo.photoURL ?? undefined,
    disabled: userInfo.disabled ?? undefined,
  });

  return {
    uid: updated.uid,
    displayName: updated.displayName,
    email: updated.email,
    phoneNumber: updated.phoneNumber,
    photoURL: updated.photoURL,
    disabled: updated.disabled,
  };
};

const createAuthCustomToken = async (
  userId: string,
  customClaims?: Record<string, any>,
): Promise<string> => {
  return getAuth().createCustomToken(userId, customClaims);
};

const createAuthUser = async (uid: string, user: Omit<UserInfo, 'uid'>): Promise<UserInfo> => {
  const created = await getAuth().createUser({
    uid,
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    photoURL: user.photoURL ?? undefined,
    disabled: user.disabled ?? undefined,
  });

  return {
    uid: created.uid,
    displayName: created.displayName,
    email: created.email,
    phoneNumber: created.phoneNumber,
    photoURL: created.photoURL,
    disabled: created.disabled,
  };
};

const deleteAuthUser = async (uid: string): Promise<void> => {
  await getAuth().deleteUser(uid);
};

export {
  getBucket,
  firebaseConfig,
  getDB,
  deleteAuthUser,
  validateAuthToken,
  getAuthUser,
  updateAuthUser,
  createAuthCustomToken,
  createAuthUser,
};
