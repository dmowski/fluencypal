import * as Sentry from '@sentry/nextjs';
import { captureServerException } from './captureServerException';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(() => ''),
  flush: jest.fn(async () => true),
}));

describe('captureServerException', () => {
  afterEach(() => {
    jest.mocked(Sentry.captureException).mockClear();
    jest.mocked(Sentry.flush).mockClear();
  });

  it('captures and flushes so serverless can exit', async () => {
    const error = new Error('TTS failed');
    await captureServerException(error, { tags: { route: '/api/ttsStream' } });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { route: '/api/ttsStream' },
    });
    expect(Sentry.flush).toHaveBeenCalled();
  });
});
