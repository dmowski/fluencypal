import WebSocket from 'ws';
import { createEmulatorTestUser } from '../e2e/helpers/emulatorAuth.js';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8081';
const DEFAULT_SESSIONS = 5;

const baseUrl = process.env.REALTIME_BASE_URL ?? DEFAULT_BASE_URL;
const sessionCount = Number(process.env.LOAD_SESSIONS ?? DEFAULT_SESSIONS);
const wsUrl = `${baseUrl.replace(/^http/, 'ws')}/v1/session`;

const waitForOpen = (socket: WebSocket) =>
  new Promise<void>((resolve, reject) => {
    socket.once('open', () => resolve());
    socket.once('error', reject);
  });

const waitForType = (socket: WebSocket, type: string, timeoutMs = 15_000) =>
  new Promise<Record<string, unknown>>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${type}`)), timeoutMs);

    const onMessage = (raw: WebSocket.RawData) => {
      const message = JSON.parse(raw.toString()) as Record<string, unknown>;
      if (message.type === type) {
        clearTimeout(timer);
        socket.off('message', onMessage);
        resolve(message);
      }
    };

    socket.on('message', onMessage);
    socket.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });

const runSession = async (index: number): Promise<void> => {
  const user = await createEmulatorTestUser();
  const socket = new WebSocket(wsUrl);

  await waitForOpen(socket);

  socket.send(
    JSON.stringify({
      type: 'session.start',
      token: user.idToken,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: false,
        micMuted: true,
        systemInstruction: 'Reply with one word.',
        voice: 'shimmer',
      },
    }),
  );

  const ready = await waitForType(socket, 'session.ready');
  if (!ready.sessionId) {
    throw new Error(`Session ${index} missing sessionId`);
  }

  socket.send(JSON.stringify({ type: 'session.ping' }));
  await waitForType(socket, 'session.pong');

  socket.send(JSON.stringify({ type: 'session.end' }));
  await waitForType(socket, 'session.ended');
  socket.close();
};

const main = async () => {
  console.log(`Load smoke: ${sessionCount} sessions → ${wsUrl}`);

  const startedAt = Date.now();
  await Promise.all(Array.from({ length: sessionCount }, (_, index) => runSession(index + 1)));
  const elapsedMs = Date.now() - startedAt;

  const health = await fetch(`${baseUrl}/health`);
  const healthJson = (await health.json()) as { activeSessions?: number; metrics?: unknown };

  console.log(`Done in ${elapsedMs}ms`);
  console.log(`Active sessions after test: ${healthJson.activeSessions ?? 'unknown'}`);
  console.log('Metrics:', JSON.stringify(healthJson.metrics ?? {}, null, 2));

  if ((healthJson.activeSessions ?? 0) > 0) {
    console.error('Expected zero active sessions after smoke test');
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
