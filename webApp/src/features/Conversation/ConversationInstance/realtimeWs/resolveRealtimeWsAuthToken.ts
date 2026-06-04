export class RealtimeWsAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RealtimeWsAuthError';
  }
}

export const decodeJwtHeader = (token: string): Record<string, unknown> | null => {
  const segment = token.split('.')[0];
  if (!segment) {
    return null;
  }

  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/** Emulator JWTs lack `kid`; production Firebase ID tokens include it. */
export const isLikelyEmulatorIdToken = (token: string): boolean => {
  if (!token) {
    return false;
  }

  const header = decodeJwtHeader(token);
  if (!header) {
    return false;
  }

  return !('kid' in header && header.kid);
};

const isProductionRealtimeTarget = (wsBaseUrl: string | undefined): boolean =>
  Boolean(wsBaseUrl?.startsWith('wss://'));

export const resolveRealtimeWsAuthToken = async (
  getAuthToken: (forceRefresh?: boolean) => Promise<string>,
  wsBaseUrl?: string,
): Promise<string> => {
  const token = (await getAuthToken(true)).trim();

  if (!token) {
    throw new RealtimeWsAuthError(
      'You must be signed in to start a custom realtime call. Sign in and try again.',
    );
  }

  if (isProductionRealtimeTarget(wsBaseUrl) && isLikelyEmulatorIdToken(token)) {
    throw new RealtimeWsAuthError(
      'Firebase Auth emulator tokens cannot reach production realtime. Use pnpm dev:prod (production Firebase) for Fly WSS, or pnpm dev with local realtime on port 8081.',
    );
  }

  return token;
};
