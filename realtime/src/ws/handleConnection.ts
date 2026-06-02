import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { AuthError } from '../auth/types.js';
import { validateIdToken } from '../auth/firebase.js';
import { initSessionLog, sessionLog, sessionWarn } from '../log/sessionLog.js';
import { ProtocolError, parseClientMessage, serializeServerMessage } from '../protocol/messages.js';
import type { ConversationSession } from '../session/ConversationSession.js';
import { sessionManager } from '../session/SessionManager.js';
import { env } from '../config/env.js';
import { isAllowedOrigin, rejectOriginMessage } from './originGuard.js';

const sendMessage = (socket: WebSocket, message: Parameters<typeof serializeServerMessage>[0]) => {
  if (socket.readyState === socket.OPEN) {
    socket.send(serializeServerMessage(message));
  }
};

const sendError = (
  socket: WebSocket,
  code: string,
  message: string,
  fatal = false,
): void => {
  sendMessage(socket, { type: 'error', code, message, fatal });
};

const toBuffer = (raw: WebSocket.RawData): Buffer => {
  if (Buffer.isBuffer(raw)) {
    return raw;
  }

  if (raw instanceof ArrayBuffer) {
    return Buffer.from(raw);
  }

  if (Array.isArray(raw)) {
    return Buffer.concat(raw);
  }

  return Buffer.from(String(raw));
};

export const registerWebSocketRoutes = async (app: FastifyInstance): Promise<void> => {
  await app.register(websocket);
  initSessionLog(app.log);

  app.get('/v1/session', { websocket: true }, (socket, request) => {
    const origin = request.headers.origin;

    if (env.NODE_ENV === 'production' && !isAllowedOrigin(origin, request.headers.host)) {
      sessionWarn(null, 'ws.origin_rejected', {
        origin: origin ?? null,
        host: request.headers.host ?? null,
        allowedOrigins: env.ALLOWED_ORIGINS,
      });
      socket.close(1008, rejectOriginMessage(origin));
      return;
    }

    let session: ConversationSession | null = null;
    let started = false;
    let binaryFrameCount = 0;

    const sendForSession = (message: Parameters<typeof serializeServerMessage>[0]) => {
      sendMessage(socket, message);
    };

    const sendBinaryForSession = (chunk: Buffer) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(chunk);
      }
    };

    socket.on('message', async (raw, isBinary) => {
      const sessionId = session?.sessionId ?? null;

      try {
        if (isBinary) {
          const data = toBuffer(raw);
          binaryFrameCount += 1;

          if (binaryFrameCount === 1 || binaryFrameCount % 50 === 0) {
            sessionLog(sessionId, 'ws.binary_frame', {
              bytes: data.length,
              frameCount: binaryFrameCount,
            });
          }

          if (!session) {
            sessionWarn(null, 'ws.binary_before_session', { bytes: data.length });
            sendError(socket, 'session.not_started', 'Send session.start before audio frames', true);
            return;
          }

          session.handleBinaryAudio(data);
          return;
        }

        const data = toBuffer(raw);
        const text = data.toString('utf8');
        const payload = JSON.parse(text) as unknown;
        const message = parseClientMessage(payload);

        sessionLog(sessionId, 'ws.json_frame', { type: message.type });

        if (message.type === 'session.start') {
          if (started) {
            sendError(socket, 'session.already_started', 'Session already started', true);
            return;
          }

          const user = await validateIdToken(message.token);
          session = sessionManager.createSession(
            user,
            message.config,
            sendForSession,
            sendBinaryForSession,
          );
          started = true;
          sessionLog(session.sessionId, 'session.started', {
            mode: message.config.mode,
            voiceEnabled: message.config.voiceEnabled,
            userId: user.uid,
          });
          sendMessage(socket, sessionManager.buildSessionReadyMessage(session));
          return;
        }

        if (!session) {
          sendError(socket, 'session.not_started', 'First message must be session.start', true);
          return;
        }

        await session.handleClientMessage(message);
      } catch (error) {
        if (error instanceof ProtocolError) {
          sendError(socket, 'protocol.invalid', error.message);
          return;
        }

        if (error instanceof AuthError) {
          sendError(socket, error.code, error.message, true);
          return;
        }

        if (error instanceof SyntaxError) {
          const preview = toBuffer(raw).toString('utf8').slice(0, 120);
          sessionWarn(sessionId, 'ws.invalid_json', {
            preview,
            isBinary,
            byteLength: toBuffer(raw).length,
          });
          sendError(socket, 'protocol.invalid_json', 'Invalid JSON frame');
          return;
        }

        app.log.error(error);
        sendError(socket, 'internal_error', 'Unexpected server error');
      }
    });

    socket.on('close', () => {
      if (session) {
        sessionLog(session.sessionId, 'ws.closed', { binaryFrameCount });
        sessionManager.removeSession(session.sessionId);
        session = null;
      }
    });
  });
};
