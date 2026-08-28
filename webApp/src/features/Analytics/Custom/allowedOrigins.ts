const PRODUCTION_ORIGINS = new Set([
  'https://www.fluencypal.com',
  'https://app.fluencypal.com',
  'https://book.fluencypal.com',
  'https://fluencypal.com',
]);

const isLocalHostname = (hostname: string): boolean => {
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const isAllowedAnalyticsOrigin = (origin: string): boolean => {
  if (!origin) return false;
  if (PRODUCTION_ORIGINS.has(origin)) return true;

  try {
    const url = new URL(origin);
    if (isLocalHostname(url.hostname) && (url.protocol === 'http:' || url.protocol === 'https:')) {
      return true;
    }
    if (url.protocol === 'https:' && url.hostname.endsWith('.fluencypal.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

export const isAllowedIngestHost = (host: string): boolean => {
  const hostname = host.split(':')[0]?.toLowerCase() || '';
  if (isLocalHostname(hostname)) return true;
  if (hostname === 'app.fluencypal.com') return true;
  if (hostname.endsWith('.fluencypal.com')) return true;
  return false;
};
