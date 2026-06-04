import {
  decodeJwtHeader,
  isLikelyEmulatorIdToken,
  RealtimeWsAuthError,
  resolveRealtimeWsAuthToken,
} from './resolveRealtimeWsAuthToken';

const encodeHeader = (header: object): string => {
  const json = Buffer.from(JSON.stringify(header)).toString('base64url');
  return `${json}.payload.sig`;
};

describe('resolveRealtimeWsAuthToken', () => {
  it('decodeJwtHeader reads kid when present', () => {
    const token = encodeHeader({ alg: 'RS256', kid: 'abc123' });
    expect(decodeJwtHeader(token)).toMatchObject({ kid: 'abc123' });
  });

  it('isLikelyEmulatorIdToken is true without kid', () => {
    expect(isLikelyEmulatorIdToken(encodeHeader({ alg: 'none' }))).toBe(true);
  });

  it('isLikelyEmulatorIdToken is false with kid', () => {
    expect(isLikelyEmulatorIdToken(encodeHeader({ alg: 'RS256', kid: 'x' }))).toBe(false);
  });

  it('throws when token is empty', async () => {
    await expect(resolveRealtimeWsAuthToken(async () => '')).rejects.toBeInstanceOf(
      RealtimeWsAuthError,
    );
  });

  it('throws for emulator-shaped token against production WSS', async () => {
    const emulatorToken = encodeHeader({ alg: 'none' });
    await expect(
      resolveRealtimeWsAuthToken(async () => emulatorToken, 'wss://fluencypal-realtime.fly.dev'),
    ).rejects.toThrow(/emulator/i);
  });

  it('allows emulator-shaped token for local WS (e2e / local realtime)', async () => {
    const emulatorToken = encodeHeader({ alg: 'none' });
    await expect(
      resolveRealtimeWsAuthToken(async () => emulatorToken, 'ws://127.0.0.1:8081'),
    ).resolves.toBe(emulatorToken);
  });

  it('returns production-shaped token', async () => {
    const token = encodeHeader({ alg: 'RS256', kid: 'key-1' });
    await expect(
      resolveRealtimeWsAuthToken(async () => token, 'wss://fluencypal-realtime.fly.dev'),
    ).resolves.toBe(token);
  });
});
