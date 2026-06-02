import { randomUUID } from 'node:crypto';
import type { AuthUserInfo } from '../auth/types.js';
import type { SessionStartConfig, ServerMessage } from '../protocol/messages.js';
import { ConversationSession, type SendServerMessage } from './ConversationSession.js';

export class SessionManager {
  private readonly sessions = new Map<string, ConversationSession>();

  createSession(
    user: AuthUserInfo,
    config: SessionStartConfig,
    send: SendServerMessage,
  ): ConversationSession {
    const sessionId = randomUUID();
    const session = new ConversationSession({
      sessionId,
      user,
      config,
      send,
    });

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.dispose('removed');
    this.sessions.delete(sessionId);
  }

  disposeAll(): void {
    for (const session of this.sessions.values()) {
      session.dispose('shutdown');
    }
    this.sessions.clear();
  }

  get activeCount(): number {
    return this.sessions.size;
  }

  buildSessionReadyMessage(session: ConversationSession): ServerMessage {
    const config = session.runtimeConfig;
    return {
      type: 'session.ready',
      sessionId: session.sessionId,
      mode: config.mode,
      voice: config.voice,
      voiceEnabled: config.voiceEnabled,
      micMuted: config.micMuted,
    };
  }
}

export const sessionManager = new SessionManager();
