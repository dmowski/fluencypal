const GRPC_DEADLINE_EXCEEDED = 4;
const GRPC_UNAVAILABLE = 14;

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const TRANSLATE_MAX_ATTEMPTS = 3;
export const TRANSLATE_RETRY_BASE_DELAY_MS = 200;

/**
 * Google Translate gRPC / network failures that succeed on a fresh client.
 * Seen in production as `14 UNAVAILABLE: read ECONNRESET` on Vercel isolates
 * that reuse a cached TranslationServiceClient after the channel dies.
 */
export const isTransientTranslateError = (error: unknown): boolean => {
  if (!error) return false;

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code: unknown }).code
      : undefined;

  if (
    code === GRPC_UNAVAILABLE ||
    code === GRPC_DEADLINE_EXCEEDED ||
    code === 'UNAVAILABLE' ||
    code === 'DEADLINE_EXCEEDED'
  ) {
    return true;
  }

  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';

  return /ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|UNAVAILABLE|DEADLINE_EXCEEDED/i.test(message);
};

export const retryTransientTranslate = async <T>(
  run: () => Promise<T>,
  options?: {
    reset?: () => void;
    sleep?: (ms: number) => Promise<void>;
    maxAttempts?: number;
  },
): Promise<T> => {
  const maxAttempts = options?.maxAttempts ?? TRANSLATE_MAX_ATTEMPTS;
  const sleep = options?.sleep ?? defaultSleep;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await run();
    } catch (error) {
      const isLast = attempt === maxAttempts - 1;
      if (!isTransientTranslateError(error) || isLast) {
        throw error;
      }
      options?.reset?.();
      await sleep(TRANSLATE_RETRY_BASE_DELAY_MS * 2 ** attempt);
    }
  }

  throw new Error('Translation retry exhausted');
};
