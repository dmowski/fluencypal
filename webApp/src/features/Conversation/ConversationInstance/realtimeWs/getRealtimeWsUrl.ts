/** Default when `pnpm dev` + local `realtime` on REALTIME_PORT. */
const DEFAULT_LOCAL_REALTIME_WS = 'ws://127.0.0.1:8081';

const normalizeWsBase = (url: string | undefined): string | undefined => {
  const trimmed = url?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.replace(/\/$/, '') : undefined;
};

const isDevFirebaseStack = (): boolean =>
  process.env.NEXT_PUBLIC_IS_FIREBASE_EMULATOR === 'true';

/**
 * Resolves the custom realtime WebSocket base URL.
 *
 * - `pnpm dev` (emulator): `NEXT_PUBLIC_REALTIME_WS_URL_DEV` → legacy `NEXT_PUBLIC_REALTIME_WS_URL` → `ws://127.0.0.1:8081`
 * - `pnpm dev:prod`: `NEXT_PUBLIC_REALTIME_WS_URL_PROD` → legacy `NEXT_PUBLIC_REALTIME_WS_URL`
 */
export const getRealtimeWsUrl = (): string | undefined => {
  const devUrl = normalizeWsBase(process.env.NEXT_PUBLIC_REALTIME_WS_URL_DEV);
  const prodUrl = normalizeWsBase(process.env.NEXT_PUBLIC_REALTIME_WS_URL_PROD);
  const legacyUrl = normalizeWsBase(process.env.NEXT_PUBLIC_REALTIME_WS_URL);

  if (isDevFirebaseStack()) {
    return devUrl ?? legacyUrl ?? DEFAULT_LOCAL_REALTIME_WS;
  }

  return prodUrl ?? legacyUrl;
};

export const isExperimentalRealtimeWsConfigured = (): boolean => Boolean(getRealtimeWsUrl());

export const buildRealtimeWsSessionUrl = (): string => {
  const base = getRealtimeWsUrl();
  if (base) {
    return `${base}/v1/session`;
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost';
  return `${protocol}://${host}/v1/session`;
};
