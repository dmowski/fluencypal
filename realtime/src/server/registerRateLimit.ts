import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

const HEALTH_PATHS = new Set(['/health', '/ready']);

const clientKey = (request: { ip: string; headers: Record<string, unknown> }): string => {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? request.ip;
  }

  if (Array.isArray(forwarded) && typeof forwarded[0] === 'string') {
    return forwarded[0].split(',')[0]?.trim() ?? request.ip;
  }

  return request.ip;
};

export const registerRateLimit = async (app: FastifyInstance): Promise<void> => {
  if (env.NODE_ENV === 'test' || !env.RATE_LIMIT_ENABLED) {
    return;
  }

  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (request) => clientKey(request),
    allowList: (request) => HEALTH_PATHS.has(request.url.split('?')[0] ?? ''),
    errorResponseBuilder: (_request, context) => ({
      ok: false,
      code: 'rate_limit_exceeded',
      message: 'Too many requests. Try again later.',
      retryAfterSec: Math.ceil(context.ttl / 1000),
    }),
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  });

  app.addHook('onRoute', (routeOptions) => {
    if (routeOptions.url === '/v1/session') {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: {
          max: env.RATE_LIMIT_WS_MAX,
          timeWindow: env.RATE_LIMIT_WINDOW_MS,
        },
      };
    }
  });
};
