import { GetTodayNewsRequest, GetTodayNewsResponse } from '../types';

// Delays (ms) to wait before each successive retry attempt.
// Retries are triggered by a 504 response or an empty items list.
const RETRY_DELAYS_MS = [10_000, 20_000, 30_000] as const;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const getTodayNewsRequest = async (
  request: GetTodayNewsRequest,
  token: string | null,
): Promise<GetTodayNewsResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const body = JSON.stringify(request);

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch('/api/news/getTodayNews', {
      method: 'POST',
      headers,
      body,
    });

    const isRetryable = response.status === 504 || response.status === 503;

    if (!response.ok && !isRetryable) {
      throw new Error(`getTodayNews failed: ${response.status}`);
    }

    if (response.ok) {
      const data = (await response.json()) as GetTodayNewsResponse;
      if (data.items.length > 0) {
        return data;
      }
      // Empty items — treat as retryable (AI processing may still be in progress)
    }

    const delayMs = RETRY_DELAYS_MS[attempt];
    if (delayMs === undefined) {
      throw new Error(`getTodayNews: no results after ${attempt} attempt(s)`);
    }
    await wait(delayMs);
  }

  // Unreachable, but satisfies TypeScript's control-flow analysis.
  throw new Error('getTodayNews: exhausted all attempts');
};
