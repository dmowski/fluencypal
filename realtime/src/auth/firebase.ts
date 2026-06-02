import firebaseAdmin from 'firebase-admin';
import { env } from '../config/env.js';
import { firebaseConfig } from '../config/firebaseConfig.js';
import { AuthError, type AuthUserInfo } from './types.js';

if (env.IS_FIREBASE_EMULATOR) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

let cachedApp: firebaseAdmin.app.App | null = null;

const getServiceAccount = (): ServiceAccount => {
  if (env.IS_FIREBASE_EMULATOR) {
    return {
      project_id: env.FIREBASE_PROJECT_ID,
      client_email: 'emulator@example.com',
      private_key: '',
    };
  }

  const rawServiceAccount = env.FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS;
  if (!rawServiceAccount) {
    throw new Error('FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS is required');
  }

  const parsed = JSON.parse(rawServiceAccount) as ServiceAccount & { private_key?: string };
  return {
    ...parsed,
    private_key: parsed.private_key?.replace(/\\n/g, '\n') ?? '',
  };
};

export const initFirebaseApp = (): firebaseAdmin.app.App => {
  const existingApp = firebaseAdmin.apps[0];
  if (existingApp) {
    return existingApp;
  }

  if (cachedApp) {
    return cachedApp;
  }

  const serviceAccount = getServiceAccount();

  const appOptions: firebaseAdmin.AppOptions = env.IS_FIREBASE_EMULATOR
    ? {
        projectId: serviceAccount.project_id,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
      }
    : {
        credential: firebaseAdmin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key,
        }),
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
      };

  const app = firebaseAdmin.initializeApp(appOptions, `${firebaseConfig.projectId}-${Date.now()}`);
  cachedApp = app;
  return app;
};

export const parseBearerToken = (authorization: string | undefined): string => {
  if (!authorization) {
    throw new AuthError('missing_header', 'Authorization header is required');
  }

  const token = authorization.split('Bearer ')[1];
  if (!token) {
    throw new AuthError('missing_token', 'Token is required');
  }

  return token;
};

export const validateIdToken = async (token: string): Promise<AuthUserInfo> => {
  try {
    const app = initFirebaseApp();
    const decodedToken = await app.auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? '',
    };
  } catch (error) {
    console.error('Error validating token', error);
    throw new AuthError('invalid_token', 'Invalid token');
  }
};

export const validateAuthorizationHeader = async (
  authorization: string | undefined,
): Promise<AuthUserInfo> => {
  const token = parseBearerToken(authorization);
  return validateIdToken(token);
};

/** Reset cached app between tests. */
export const resetFirebaseAppForTests = (): void => {
  cachedApp = null;
};
