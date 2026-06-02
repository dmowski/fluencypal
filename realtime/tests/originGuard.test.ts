import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, rejectOriginMessage } from '../src/ws/originGuard.js';

describe('originGuard', () => {
  it('allows configured origins', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
  });

  it('rejects unknown origins in production mode checks via message helper', () => {
    expect(rejectOriginMessage('https://evil.example')).toContain('evil.example');
  });
});
