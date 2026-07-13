import { firebaseConfig } from '@/features/Firebase/firebaseConfig';
import { App, AppOptions, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as getFirebaseAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
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

  const appOptions: AppOptions = isFirebaseEmulator
    ? {
        projectId: serviceAccount.project_id,
        storageBucket: firebaseConfig.storageBucket,
      }
    : {
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
        storageBucket: firebaseConfig.storageBucket,
      };

  const app = initializeApp(appOptions, firebaseConfig.projectId + Date.now());

  cacheApp = app;

  return app;
};

const getBucket = () => {
  const existingApps = getApps();
  const app = existingApps[0] ?? initApp();
  return getStorage(app).bucket(firebaseConfig.storageBucket);
};

const getDB = () => {
  const existingApps = getApps();
  const app = existingApps[0] ?? initApp();
  return getFirestore(app);
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
    const decodedToken = await getFirebaseAuth(initApp()).verifyIdToken(token);

    const { uid, email } = decodedToken;

    return { uid, email: email || '' };
  } catch (error) {
    console.error('Error validating token', error);
    throw new Error('Invalid token');
  }
};

const getAuth = () => getFirebaseAuth(initApp());

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

const getUserByEmail = async (email: string): Promise<UserInfo | null> => {
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    return {
      uid: userRecord.uid,
      displayName: userRecord.displayName,
      email: userRecord.email,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
    };
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found') {
      return null;
    }
    console.error('Error fetching user by email', error);
    return null;
  }
};

const listRecentAuthUsers = async (
  limit: number,
): Promise<{ uid: string; email: string | null; createdAtIso: string | null }[]> => {
  const result = await getAuth().listUsers(1000);
  const sorted = result.users
    .slice()
    .sort((a, b) => {
      const aTime = a.metadata.creationTime ? new Date(a.metadata.creationTime).getTime() : 0;
      const bTime = b.metadata.creationTime ? new Date(b.metadata.creationTime).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);

  return sorted.map((u) => ({
    uid: u.uid,
    email: u.email ?? null,
    createdAtIso: u.metadata.creationTime ?? null,
  }));
};

export {
  getBucket,
  firebaseConfig,
  getDB,
  deleteAuthUser,
  getUserByEmail,
  validateAuthToken,
  getAuthUser,
  updateAuthUser,
  createAuthCustomToken,
  createAuthUser,
  listRecentAuthUsers,
};
