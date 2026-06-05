import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AuthUserInfo } from '../src/auth/types.js';
import { ConversationSession } from '../src/session/ConversationSession.js';
import { SessionManager } from '../src/session/SessionManager.js';
import type { ServerMessage } from '../src/protocol/messages.js';
import { createMockProviders } from './helpers/mockProviders.js';

const testUser: AuthUserInfo = { uid: 'user-1', email: 'user@example.com' };

const baseConfig = {
  languageCode: 'en',
  mode: 'PushToTalk' as const,
  voiceEnabled: true,
  micEnabled: true,
  systemInstruction: 'Teach English.',
  voice: 'shimmer' as const,
};

describe('ConversationSession', () => {
  it('handles ping and end lifecycle', async () => {
    const sent: ServerMessage[] = [];
    const session = new ConversationSession({
      sessionId: 's1',
      user: testUser,
      config: baseConfig,
      send: (message) => sent.push(message),
      providers: createMockProviders(),
    });

    await session.handleClientMessage({ type: 'session.ping' });
    expect(sent).toEqual([{ type: 'session.pong' }]);

    await session.handleClientMessage({ type: 'session.end' });
    expect(sent.at(-1)).toEqual({ type: 'session.ended' });
    expect(session.isDisposed).toBe(true);
    expect(session.signal.aborted).toBe(true);
  });

  it('stores user text on turn commit and generates assistant reply', async () => {
    const sent: ServerMessage[] = [];
    const session = new ConversationSession({
      sessionId: 's2',
      user: testUser,
      config: baseConfig,
      send: (message) => sent.push(message),
      providers: createMockProviders(),
    });

    await session.handleClientMessage({ type: 'user.text', text: 'Hello teacher' });
    await session.handleClientMessage({ type: 'user.turn.commit', messageId: 'msg-1' });

    expect(session.history.list()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'msg-1',
          role: 'user',
          text: 'Hello teacher',
        }),
        expect.objectContaining({
          role: 'assistant',
          text: 'Hello!',
        }),
      ]),
    );

    expect(sent).toContainEqual({
      type: 'transcript.done',
      messageId: 'msg-1',
      role: 'user',
      text: 'Hello teacher',
    });
  });

  it('aborts in-flight work on dispose', async () => {
    const onAbort = vi.fn();
    const session = new ConversationSession({
      sessionId: 's3',
      user: testUser,
      config: baseConfig,
      send: () => {},
      providers: createMockProviders(),
    });

    session.signal.addEventListener('abort', onAbort);
    session.dispose('test');

    expect(onAbort).toHaveBeenCalledTimes(1);
    await expect(session.handleClientMessage({ type: 'session.ping' })).rejects.toThrow(/closed/);
  });
});

describe('SessionManager', () => {
  let manager: SessionManager;

  afterEach(() => {
    manager?.disposeAll();
  });

  it('tracks active sessions and removes on cleanup', () => {
    manager = new SessionManager();
    const sent: ServerMessage[] = [];

    const session = manager.createSession(testUser, baseConfig, (message) => sent.push(message));
    expect(manager.activeCount).toBe(1);

    manager.removeSession(session.sessionId);
    expect(manager.activeCount).toBe(0);
    expect(session.isDisposed).toBe(true);
  });

  it('builds session.ready payload from runtime config', () => {
    manager = new SessionManager();
    const session = manager.createSession(testUser, baseConfig, () => {});

    expect(manager.buildSessionReadyMessage(session)).toEqual({
      type: 'session.ready',
      sessionId: session.sessionId,
      mode: 'PushToTalk',
      voice: 'shimmer',
      voiceEnabled: true,
      micEnabled: true,
    });
  });
});
