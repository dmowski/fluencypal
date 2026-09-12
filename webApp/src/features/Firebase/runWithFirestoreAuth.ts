import { FirebaseError } from 'firebase/app';

export const isFirebasePermissionDenied = (error: unknown): boolean => {
  if (error instanceof FirebaseError) return error.code === 'permission-denied';
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    String((error as { code: unknown }).code) === 'permission-denied'
  );
};

export const runWithFirestoreAuth = async <T>(
  getToken: (forceRefresh?: boolean) => Promise<string>,
  write: () => Promise<T>,
): Promise<T> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Cannot write to Firestore without an auth token');
  }

  try {
    return await write();
  } catch (error) {
    if (!isFirebasePermissionDenied(error)) throw error;
    const refreshed = await getToken(true);
    if (!refreshed) throw error;
    return await write();
  }
};
