import {
  isTransientTranslateError,
  retryTransientTranslate,
  TRANSLATE_RETRY_BASE_DELAY_MS,
} from './transientTranslateError';

describe('isTransientTranslateError', () => {
  it('matches the Google Translate ECONNRESET seen in production', () => {
    const error = Object.assign(new Error('14 UNAVAILABLE: read ECONNRESET'), { code: 14 });
    expect(isTransientTranslateError(error)).toBe(true);
  });

  it('matches gRPC UNAVAILABLE / DEADLINE_EXCEEDED codes', () => {
    expect(isTransientTranslateError({ code: 14, message: 'UNAVAILABLE' })).toBe(true);
    expect(isTransientTranslateError({ code: 4, message: 'DEADLINE_EXCEEDED' })).toBe(true);
    expect(isTransientTranslateError({ code: 'UNAVAILABLE' })).toBe(true);
  });

  it('rejects permanent translation failures', () => {
    expect(isTransientTranslateError(new Error('INVALID_ARGUMENT'))).toBe(false);
    expect(isTransientTranslateError({ code: 3 })).toBe(false);
    expect(isTransientTranslateError(null)).toBe(false);
  });
});

describe('retryTransientTranslate', () => {
  it('resets the client and retries transient failures', async () => {
    const reset = jest.fn();
    const sleep = jest.fn().mockResolvedValue(undefined);
    const run = jest
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('14 UNAVAILABLE: read ECONNRESET'), { code: 14 }),
      )
      .mockResolvedValueOnce('hola');

    await expect(retryTransientTranslate(run, { reset, sleep })).resolves.toBe('hola');
    expect(run).toHaveBeenCalledTimes(2);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(TRANSLATE_RETRY_BASE_DELAY_MS);
  });

  it('does not retry permanent errors', async () => {
    const reset = jest.fn();
    const run = jest.fn().mockRejectedValue(new Error('INVALID_ARGUMENT'));

    await expect(
      retryTransientTranslate(run, { reset, sleep: async () => undefined }),
    ).rejects.toThrow('INVALID_ARGUMENT');
    expect(run).toHaveBeenCalledTimes(1);
    expect(reset).not.toHaveBeenCalled();
  });

  it('rethrows after the last transient attempt', async () => {
    const error = Object.assign(new Error('14 UNAVAILABLE: read ECONNRESET'), { code: 14 });
    const run = jest.fn().mockRejectedValue(error);

    await expect(
      retryTransientTranslate(run, { maxAttempts: 2, sleep: async () => undefined }),
    ).rejects.toBe(error);
    expect(run).toHaveBeenCalledTimes(2);
  });
});
