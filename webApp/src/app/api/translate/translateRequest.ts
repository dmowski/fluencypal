import {
  TranslateBatchRequest,
  TranslateBatchResponse,
  TranslateRequest,
  TranslateResponse,
} from './types';

const TRANSLATE_CLIENT_MAX_ATTEMPTS = 3;
const TRANSLATE_CLIENT_RETRY_BASE_DELAY_MS = 200;

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type TranslateClientRetryOptions = {
  maxAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
};

const isRetryableTranslateStatus = (status: number) => status >= 500;

const fetchTranslateJson = async <T>(
  url: string,
  request: unknown,
  options?: TranslateClientRetryOptions,
): Promise<T> => {
  const maxAttempts = options?.maxAttempts ?? TRANSLATE_CLIENT_MAX_ATTEMPTS;
  const sleep = options?.sleep ?? defaultSleep;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      if (isRetryableTranslateStatus(response.status) && attempt < maxAttempts - 1) {
        await sleep(TRANSLATE_CLIENT_RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }

      throw new Error('Translation failed');
    } catch (error) {
      if (error instanceof Error && error.message === 'Translation failed') {
        throw error;
      }
      if (attempt >= maxAttempts - 1) {
        throw error;
      }
      await sleep(TRANSLATE_CLIENT_RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }

  throw new Error('Translation failed');
};

export const translateRequest = async (
  request: TranslateRequest,
  options?: TranslateClientRetryOptions,
): Promise<TranslateResponse> => {
  return fetchTranslateJson<TranslateResponse>('/api/translate', request, options);
};

export const translateBatchRequest = async (
  request: TranslateBatchRequest,
  options?: TranslateClientRetryOptions,
): Promise<TranslateBatchResponse> => {
  return fetchTranslateJson<TranslateBatchResponse>('/api/translate/batch', request, options);
};
