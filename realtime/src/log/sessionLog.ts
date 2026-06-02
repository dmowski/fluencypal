import type { FastifyBaseLogger } from 'fastify';

let logger: FastifyBaseLogger | null = null;

export const initSessionLog = (log: FastifyBaseLogger): void => {
  logger = log;
};

export const sessionLog = (
  sessionId: string | null,
  event: string,
  data?: Record<string, unknown>,
): void => {
  if (!logger || process.env.NODE_ENV === 'test') {
    return;
  }

  logger.info({ sessionId, event, ...data }, `[session] ${event}`);
};

export const sessionWarn = (
  sessionId: string | null,
  event: string,
  data?: Record<string, unknown>,
): void => {
  if (!logger || process.env.NODE_ENV === 'test') {
    return;
  }

  logger.warn({ sessionId, event, ...data }, `[session] ${event}`);
};
