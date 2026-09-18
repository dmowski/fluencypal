import * as Sentry from '@sentry/nextjs';

export const SERVER_SENTRY_FLUSH_MS = 2000;

/**
 * Capture a server exception and flush the transport.
 * Serverless/Vercel functions otherwise exit before the event is sent.
 */
export const captureServerException = async (
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    fingerprint?: string[];
    level?: 'fatal' | 'error' | 'warning';
  },
): Promise<void> => {
  Sentry.captureException(error, context);
  await Sentry.flush(SERVER_SENTRY_FLUSH_MS);
};
