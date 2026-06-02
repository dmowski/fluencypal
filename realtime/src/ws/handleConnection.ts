import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import type { WebSocket } from 'ws';
import { AuthError } from '../auth/types.js';
import { validateIdToken } from '../auth/firebase.js';
import { ProtocolError, parseClientMessage, serializeServerMessage } from '../protocol/messages.js';
import type { ConversationSession } from '../session/ConversationSession.js';
import { sessionManager } from '../session/SessionManager.js';

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

const isJsonTextFrame = (data: Buffer): boolean => {
  const firstNonWhitespace = data.toString('utf8').trimStart()[0];
  return firstNonWhitespace === '{' || firstNonWhitespace === '[';
};

export const registerWebSocketRoutes = async (app: FastifyInstance): Promise<void> => {
  await app.register(websocket);

  app.get('/v1/session', { websocket: true }, (socket) => {
    let session: ConversationSession | null = null;
    let started = false;

    const sendForSession: Parameters<typeof sessionManager.createSession>[2] = (message) => {
      sendMessage(socket, message);
    };

    socket.on('message', async (raw) => {
      try {
        const data = toBuffer(raw);

        if (!isJsonTextFrame(data)) {
          if (!session) {
            sendError(socket, 'session.not_started', 'Send session.start before audio frames', true);
            return;
          }

          session.handleBinaryAudio(data);
          return;
        }

        const payload = JSON.parse(data.toString('utf8')) as unknown;
        const message = parseClientMessage(payload);

        if (message.type === 'session.start') {
          if (started) {
            sendError(socket, 'session.already_started', 'Session already started', true);
            return;
          }

          const user = await validateIdToken(message.token);
          session = sessionManager.createSession(user, message.config, sendForSession);
          started = true;
          sendMessage(socket, sessionManager.buildSessionReadyMessage(session));
          return;
        }

        if (!session) {
          sendError(socket, 'session.not_started', 'First message must be session.start', true);
          return;
        }

        session.handleClientMessage(message);
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
          sendError(socket, 'protocol.invalid_json', 'Invalid JSON frame');
          return;
        }

        app.log.error(error);
        sendError(socket, 'internal_error', 'Unexpected server error');
      }
    });

    socket.on('close', () => {
      if (session) {
        sessionManager.removeSession(session.sessionId);
        session = null;
      }
    });
  });
};
