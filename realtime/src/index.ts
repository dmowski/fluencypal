import Fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { AuthError } from './auth/types.js';
import { validateAuthorizationHeader } from './auth/firebase.js';
import { getListenPort } from './config/listenPort.js';
import { env } from './config/env.js';
import { sessionManager } from './session/SessionManager.js';
import { registerGracefulShutdown, registerHttpRoutes } from './server/httpRoutes.js';
import { registerRateLimit } from './server/registerRateLimit.js';
import { registerClient } from './server/registerClient.js';
import { registerWebSocketRoutes } from './ws/handleConnection.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
    bodyLimit: 1_048_576,
    requestTimeout: 120_000,
  });

  await registerRateLimit(app);
  registerHttpRoutes(app);

  app.get('/v1/auth/verify', {
    config: {
      rateLimit: {
        max: env.RATE_LIMIT_AUTH_VERIFY_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
      },
    },
  }, async (request, reply) => {
    try {
      const user = await validateAuthorizationHeader(request.headers.authorization);
      return { ok: true, user };
    } catch (error) {
      if (error instanceof AuthError) {
        return reply.code(401).send({ ok: false, code: error.code, message: error.message });
      }

      request.log.error(error);
      return reply.code(500).send({ ok: false, code: 'internal_error', message: 'Auth failed' });
    }
  });

  await registerWebSocketRoutes(app);

  if (env.NODE_ENV === 'production') {
    await registerClient(app);
  }

  app.addHook('onClose', async () => {
    sessionManager.disposeAll();
  });

  if (env.NODE_ENV !== 'test') {
    registerGracefulShutdown(app);
  }

  return app;
};

const start = async () => {
  const app = await buildApp();
  const port = getListenPort();

  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(
      { allowedOrigins: env.ALLOWED_ORIGINS, flyApp: process.env.FLY_APP_NAME ?? null },
      `realtime service listening on port ${port}`,
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void start();
}
