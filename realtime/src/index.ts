import Fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import { AuthError } from './auth/types.js';
import { validateAuthorizationHeader } from './auth/firebase.js';
import { env } from './config/env.js';

export const buildApp = () => {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'fluencypal-realtime',
    version: '0.1.0',
  }));

  app.get('/v1/auth/verify', async (request, reply) => {
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

  return app;
};

const start = async () => {
  const app = buildApp();

  try {
    await app.listen({ port: env.REALTIME_PORT, host: '0.0.0.0' });
    app.log.info(`realtime service listening on port ${env.REALTIME_PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void start();
}
