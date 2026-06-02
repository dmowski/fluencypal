import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { sessionManager } from '../session/SessionManager.js';
import { getMetricsSnapshot } from '../metrics/sessionMetrics.js';
import { normalizeOrigin } from '../ws/originGuard.js';

let shuttingDown = false;

export const isShuttingDown = (): boolean => shuttingDown;

export const registerHttpRoutes = (app: FastifyInstance): void => {
  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;
    if (
      origin &&
      env.ALLOWED_ORIGINS.some((allowed) => normalizeOrigin(allowed) === normalizeOrigin(origin))
    ) {
      reply.header('Access-Control-Allow-Origin', origin);
      reply.header('Vary', 'Origin');
    }

    if (request.method === 'OPTIONS') {
      reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      return reply.code(204).send();
    }
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'fluencypal-realtime',
    version: '0.1.0',
    activeSessions: sessionManager.activeCount,
    firebaseEmulator: env.IS_FIREBASE_EMULATOR,
    port: env.REALTIME_PORT,
    metrics: getMetricsSnapshot(sessionManager.activeCount),
  }));

  app.get('/ready', async (_request, reply) => {
    if (shuttingDown) {
      return reply.code(503).send({
        ok: false,
        reason: 'shutting_down',
        activeSessions: sessionManager.activeCount,
      });
    }

    return {
      ok: true,
      activeSessions: sessionManager.activeCount,
      metrics: getMetricsSnapshot(sessionManager.activeCount),
    };
  });
};

export const registerGracefulShutdown = (app: FastifyInstance): void => {
  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    app.log.info(
      { signal, activeSessions: sessionManager.activeCount },
      'Graceful shutdown started — draining sessions',
    );

    sessionManager.disposeAll();

    try {
      await app.close();
      app.log.info('Server closed');
      process.exit(0);
    } catch (error) {
      app.log.error(error, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
};
