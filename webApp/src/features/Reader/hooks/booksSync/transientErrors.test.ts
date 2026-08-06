import {
  isTransientStorageError,
  nextTransientRetryDelayMs,
  PUSH_TRANSIENT_RETRY_BASE_MS,
  PUSH_TRANSIENT_RETRY_MAX_MS,
} from './transientErrors';

describe('isTransientStorageError', () => {
  it('recognizes retry-limit-exceeded', () => {
    expect(isTransientStorageError({ code: 'storage/retry-limit-exceeded' })).toBe(true);
  });

  it('recognizes canceled and unknown storage codes', () => {
    expect(isTransientStorageError({ code: 'storage/canceled' })).toBe(true);
    expect(isTransientStorageError({ code: 'storage/unknown' })).toBe(true);
  });

  it('rejects permanent storage and unrelated errors', () => {
    expect(isTransientStorageError({ code: 'storage/unauthorized' })).toBe(false);
    expect(isTransientStorageError({ code: 'storage/object-not-found' })).toBe(false);
    expect(isTransientStorageError(new Error('boom'))).toBe(false);
    expect(isTransientStorageError(null)).toBe(false);
  });
});

describe('nextTransientRetryDelayMs', () => {
  it('starts at the base delay and doubles', () => {
    expect(nextTransientRetryDelayMs(0)).toBe(PUSH_TRANSIENT_RETRY_BASE_MS);
    expect(nextTransientRetryDelayMs(1)).toBe(PUSH_TRANSIENT_RETRY_BASE_MS * 2);
    expect(nextTransientRetryDelayMs(2)).toBe(PUSH_TRANSIENT_RETRY_BASE_MS * 4);
  });

  it('caps at the max delay', () => {
    expect(nextTransientRetryDelayMs(20)).toBe(PUSH_TRANSIENT_RETRY_MAX_MS);
  });
});
