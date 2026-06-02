export const getRealtimeWsUrl = (): string | undefined => {
  const url = process.env.NEXT_PUBLIC_REALTIME_WS_URL?.trim();
  return url && url.length > 0 ? url.replace(/\/$/, '') : undefined;
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
