import { env } from '../config/env.js';

export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) {
    return env.NODE_ENV !== 'production';
  }

  return env.ALLOWED_ORIGINS.includes(origin);
};

export const rejectOriginMessage = (origin: string | undefined): string =>
  `Origin not allowed: ${origin ?? '(missing)'}`;
