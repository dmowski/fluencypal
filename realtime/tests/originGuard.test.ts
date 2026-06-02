import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, normalizeOrigin, rejectOriginMessage } from '../src/ws/originGuard.js';

describe('originGuard', () => {
  it('allows configured origins', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
  });

  it('allows same-origin when request host matches', () => {
    expect(
      isAllowedOrigin('https://fluencypal-realtime.fly.dev', 'fluencypal-realtime.fly.dev'),
    ).toBe(true);
  });

  it('normalizes trailing slashes', () => {
    expect(normalizeOrigin('https://example.com/')).toBe('https://example.com');
  });

  it('rejects unknown origins in production mode checks via message helper', () => {
    expect(rejectOriginMessage('https://evil.example')).toContain('evil.example');
  });
});
