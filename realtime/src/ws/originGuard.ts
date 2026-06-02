import { env } from '../config/env.js';

export const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/$/, '');

export const isAllowedOrigin = (origin: string | undefined, requestHost?: string): boolean => {
  if (!origin) {
    return env.NODE_ENV !== 'production';
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (requestHost) {
    try {
      const originHost = new URL(normalizedOrigin).host;
      const hostHeader = requestHost.split(',')[0]?.trim() ?? requestHost;
      if (originHost === hostHeader) {
        return true;
      }
    } catch {
      // ignore malformed origin
    }
  }

  return env.ALLOWED_ORIGINS.some((allowed) => normalizeOrigin(allowed) === normalizedOrigin);
};

export const rejectOriginMessage = (origin: string | undefined): string =>
  `Origin not allowed: ${origin ?? '(missing)'}`;
