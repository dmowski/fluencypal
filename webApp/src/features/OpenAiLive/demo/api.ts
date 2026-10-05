import { auth } from '@/features/Firebase/init';
import { ensureAnonymousAuth } from '@/features/Auth/anonymousAuth';
import { OpenAiLiveApiError } from '../api';

export const demoRequest = async <T>(body?: Record<string, unknown>): Promise<T> => {
  await ensureAnonymousAuth(auth);
  const token = await auth.currentUser?.getIdToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40_000);
  try {
    const response = await fetch('/api/openAiLive/demo', {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok)
      throw new OpenAiLiveApiError(data.error || 'Could not start the demo.', response.status);
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
};
