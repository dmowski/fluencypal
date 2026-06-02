import { describe, expect, it } from 'vitest';
import { isAbortError } from '../src/errors/isAbortError.js';

describe('isAbortError', () => {
  it('detects APIUserAbortError', () => {
    expect(isAbortError({ name: 'APIUserAbortError', message: 'Request was aborted.' })).toBe(true);
  });

  it('detects AbortError', () => {
    expect(isAbortError({ name: 'AbortError', message: 'The operation was aborted' })).toBe(true);
  });

  it('rejects unrelated errors', () => {
    expect(isAbortError(new Error('network down'))).toBe(false);
  });
});
