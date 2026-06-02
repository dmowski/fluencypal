import type { WebSocket } from 'ws';
import { serializeServerMessage } from '../protocol/messages.js';
import type { ConversationSession } from '../session/ConversationSession.js';
import { sessionManager } from '../session/SessionManager.js';

export const closeSessionSocket = ({
  socket,
  session,
  reason,
  closeCode = 1000,
}: {
  socket: WebSocket;
  session: ConversationSession | null;
  reason: string;
  closeCode?: number;
}): void => {
  if (session) {
    session.dispose(reason);
    if (socket.readyState === socket.OPEN) {
      socket.send(serializeServerMessage({ type: 'session.ended' }));
    }
    sessionManager.removeSession(session.sessionId);
  }

  if (socket.readyState === socket.OPEN) {
    socket.close(closeCode, reason.slice(0, 120));
  }
};
