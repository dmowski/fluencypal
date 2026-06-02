import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

const API_PREFIXES = ['/v1', '/health', '/ready'];

const resolveTestClientDir = (): string | null => {
  const candidates = [
    path.join(process.cwd(), 'test-client-dist'),
    path.join(process.cwd(), 'test-client', 'dist'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../../test-client-dist'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../../test-client/dist'),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }

  return null;
};

export const registerTestClient = async (app: FastifyInstance): Promise<string | null> => {
  const root = resolveTestClientDir();
  if (!root) {
    return null;
  }

  await app.register(fastifyStatic, {
    root,
    prefix: '/',
    decorateReply: true,
  });

  app.get('/', async (_request, reply) => reply.sendFile('index.html', root));

  app.setNotFoundHandler(async (request, reply) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return reply.code(404).send({ error: 'Not found' });
    }

    const url = request.url.split('?')[0] ?? request.url;
    if (API_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`))) {
      return reply.code(404).send({ error: 'Not found' });
    }

    if (path.extname(url)) {
      return reply.code(404).send({ error: 'Not found' });
    }

    return reply.sendFile('index.html', root);
  });

  app.log.info({ root }, 'Test client static files enabled at /');
  return root;
};

export const resolveTestClientDirForTests = resolveTestClientDir;
