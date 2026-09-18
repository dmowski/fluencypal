import { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import * as Sentry from '@sentry/nextjs';

const SIGTERM_FLUSH_MS = 1000;

export type InFlightHttpRequest = {
  method: string;
  path: string;
  startedAt: number;
};

export const requestPathWithoutQuery = (url: string | undefined): string => {
  if (!url) {
    return 'unknown';
  }
  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? url : url.slice(0, queryIndex);
};

export class InFlightHttpTracker {
  private readonly requests = new Set<InFlightHttpRequest>();

  track(req: Pick<IncomingMessage, 'method' | 'url'>, res: EventEmitter): InFlightHttpRequest {
    const tracked: InFlightHttpRequest = {
      method: req.method || 'GET',
      path: requestPathWithoutQuery(req.url),
      startedAt: Date.now(),
    };
    this.requests.add(tracked);

    const done = () => {
      this.requests.delete(tracked);
      res.off('finish', done);
      res.off('close', done);
    };
    res.on('finish', done);
    res.on('close', done);
    return tracked;
  }

  snapshot(now = Date.now()): Array<InFlightHttpRequest & { durationMs: number }> {
    return [...this.requests].map((request) => ({
      ...request,
      durationMs: now - request.startedAt,
    }));
  }

  get size(): number {
    return this.requests.size;
  }
}

export const createVercelRuntimeTimeoutError = (
  requests: Array<InFlightHttpRequest & { durationMs?: number }>,
): Error => {
  const primary = requests[0];
  const route = primary ? `${primary.method} ${primary.path}` : 'an in-flight request';
  const error = new Error(`Vercel Runtime Timeout Error: Task timed out while handling ${route}`);
  error.name = 'VercelRuntimeTimeoutError';
  return error;
};

export const reportVercelRuntimeTermination = async (options: {
  signal: string;
  requests: Array<InFlightHttpRequest & { durationMs?: number }>;
  captureException?: typeof Sentry.captureException;
  flush?: (timeout: number) => Promise<boolean>;
}): Promise<boolean> => {
  const captureException = options.captureException ?? Sentry.captureException;
  const flush = options.flush ?? Sentry.flush;

  if (options.requests.length === 0) {
    await flush(SIGTERM_FLUSH_MS);
    return false;
  }

  const primary = options.requests[0];
  if (!primary) {
    await flush(SIGTERM_FLUSH_MS);
    return false;
  }
  const error = createVercelRuntimeTimeoutError(options.requests);
  captureException(error, {
    level: 'error',
    tags: {
      area: 'server',
      op: 'vercel-runtime-timeout',
      signal: options.signal,
      route: primary.path,
    },
    extra: {
      inFlightCount: options.requests.length,
      inFlight: options.requests.map((request) => ({
        method: request.method,
        path: request.path,
        durationMs: request.durationMs,
      })),
    },
    fingerprint: ['vercel-runtime-timeout', primary.method, primary.path],
  });
  await flush(SIGTERM_FLUSH_MS);
  return true;
};
