import { EventEmitter } from 'node:events';
import {
  createVercelRuntimeTimeoutError,
  InFlightHttpTracker,
  reportVercelRuntimeTermination,
  requestPathWithoutQuery,
} from './vercelRuntimeErrorReporter';

describe('requestPathWithoutQuery', () => {
  it('strips query strings so TTS input is not sent to Sentry', () => {
    expect(requestPathWithoutQuery('/api/ttsStream?input=secret-text&voice=marin')).toBe(
      '/api/ttsStream',
    );
  });

  it('returns unknown for missing urls', () => {
    expect(requestPathWithoutQuery(undefined)).toBe('unknown');
  });
});

describe('InFlightHttpTracker', () => {
  it('tracks a request until the response finishes', () => {
    const tracker = new InFlightHttpTracker();
    const res = new EventEmitter();

    tracker.track({ method: 'GET', url: '/api/ttsStream?input=hello' }, res);
    expect(tracker.size).toBe(1);
    expect(tracker.snapshot()[0]?.path).toBe('/api/ttsStream');

    res.emit('finish');
    expect(tracker.size).toBe(0);
  });

  it('drops a request when the socket closes without finish', () => {
    const tracker = new InFlightHttpTracker();
    const res = new EventEmitter();

    tracker.track({ method: 'POST', url: '/api/ai' }, res);
    res.emit('close');
    expect(tracker.size).toBe(0);
  });
});

describe('reportVercelRuntimeTermination', () => {
  it('captures a timeout error for in-flight requests', async () => {
    const captureException = jest.fn();
    const flush = jest.fn(async () => true);
    const requests = [
      { method: 'GET', path: '/api/ttsStream', startedAt: Date.now() - 15_000, durationMs: 15_000 },
    ];

    await expect(
      reportVercelRuntimeTermination({
        signal: 'SIGTERM',
        requests,
        captureException: captureException as never,
        flush,
      }),
    ).resolves.toBe(true);

    expect(captureException).toHaveBeenCalledTimes(1);
    const [error, context] = captureException.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe('VercelRuntimeTimeoutError');
    expect((error as Error).message).toContain('GET /api/ttsStream');
    expect(context).toMatchObject({
      tags: {
        area: 'server',
        op: 'vercel-runtime-timeout',
        signal: 'SIGTERM',
        route: '/api/ttsStream',
      },
      fingerprint: ['vercel-runtime-timeout', 'GET', '/api/ttsStream'],
    });
    expect(flush).toHaveBeenCalled();
  });

  it('does not capture when no request is in flight', async () => {
    const captureException = jest.fn();
    const flush = jest.fn(async () => true);

    await expect(
      reportVercelRuntimeTermination({
        signal: 'SIGTERM',
        requests: [],
        captureException: captureException as never,
        flush,
      }),
    ).resolves.toBe(false);

    expect(captureException).not.toHaveBeenCalled();
    expect(flush).toHaveBeenCalled();
  });
});

describe('createVercelRuntimeTimeoutError', () => {
  it('names the error so it groups separately from app exceptions', () => {
    const error = createVercelRuntimeTimeoutError([
      { method: 'GET', path: '/api/ttsStream', startedAt: 0 },
    ]);
    expect(error.name).toBe('VercelRuntimeTimeoutError');
    expect(error.message).toBe(
      'Vercel Runtime Timeout Error: Task timed out while handling GET /api/ttsStream',
    );
  });
});
