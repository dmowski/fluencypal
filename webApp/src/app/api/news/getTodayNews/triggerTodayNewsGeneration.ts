import { GetTodayNewsRequest } from '../types';

/**
 * Fire-and-forget call that triggers server-side news population into Firestore.
 * The UI reads news directly from Firebase; this endpoint only ensures fresh data
 * exists in the cache collection.
 */
export const triggerTodayNewsGeneration = async (
  request: GetTodayNewsRequest,
  token: string | null,
): Promise<void> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    await fetch('/api/news/getTodayNews', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
  } catch {
    // Generation is best-effort; the client keeps showing cached Firestore data.
  }
};
