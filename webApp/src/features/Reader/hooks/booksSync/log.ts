/**
 * Tiny console wrapper that prefixes every reader-sync diagnostic line with a
 * stable tag so engineers can grep DevTools console for `[reader-sync]`.
 */
const PREFIX = '[reader-sync]';

export const log = (message: string, data?: Record<string, unknown>): void => {
  if (data === undefined) console.log(`${PREFIX} ${message}`);
  else console.log(`${PREFIX} ${message}`, data);
};

export const warn = (message: string, data?: Record<string, unknown>, error?: unknown): void => {
  if (error === undefined) console.warn(`${PREFIX} ${message}`, data ?? {});
  else console.warn(`${PREFIX} ${message}`, data ?? {}, error);
};

export const errorLog = (
  message: string,
  data?: Record<string, unknown>,
  error?: unknown,
): void => {
  if (error === undefined) console.error(`${PREFIX} ${message}`, data ?? {});
  else console.error(`${PREFIX} ${message}`, data ?? {}, error);
};

export const getErrorCode = (error: unknown): string | null => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }
  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
};
