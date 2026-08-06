import { getErrorCode } from './log';

/**
 * Firebase Storage / network failures that are expected on flaky mobile
 * connections (especially Mobile Safari). The SDK already exhausted its own
 * retries before surfacing these — app-level backoff is the right response.
 */
const TRANSIENT_STORAGE_CODES = new Set([
  'storage/retry-limit-exceeded',
  'storage/canceled',
  'storage/unknown',
]);

export const isTransientStorageError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  return code !== null && TRANSIENT_STORAGE_CODES.has(code);
};

/** Base delay for the first transient push retry; doubles each attempt. */
export const PUSH_TRANSIENT_RETRY_BASE_MS = 5_000;
export const PUSH_TRANSIENT_RETRY_MAX_MS = 60_000;
/** After this many transient failures we surface a hard sync error to Sentry. */
export const PUSH_TRANSIENT_RETRY_MAX_ATTEMPTS = 5;

export const nextTransientRetryDelayMs = (attempt: number): number => {
  const cappedAttempt = Math.max(0, Math.min(attempt, 10));
  return Math.min(
    PUSH_TRANSIENT_RETRY_BASE_MS * 2 ** cappedAttempt,
    PUSH_TRANSIENT_RETRY_MAX_MS,
  );
};
