import { afterEach, describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { readE2eState } from './globalSetup.js';
import { createEmulatorTestUser, resetEmulatorState } from './helpers/emulatorAuth.js';
import { parseServerMessage, type ServerMessage } from '../src/protocol/messages.js';

const wsUrl = () => {
  const baseUrl = readE2eState().realtimeBaseUrl.replace(/^http/, 'ws');
  return `${baseUrl}/v1/session`;
};

const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

const runWsConversation = async ({
  config,
  onReady,
}: {
  config: Record<string, unknown>;
  onReady: (
    messages: ServerMessage[],
    send: (payload: unknown) => void,
  ) => void | Promise<void>;
}): Promise<ServerMessage[]> => {
  const user = await createEmulatorTestUser();
  const socket = new WebSocket(wsUrl());
  const messages: ServerMessage[] = [];

  await new Promise<void>((resolve, reject) => {
    socket.once('open', () => resolve());
    socket.once('error', reject);
  });

  const send = (payload: unknown) => {
    socket.send(JSON.stringify(payload));
  };

  socket.on('message', (raw) => {
    const text = raw.toString();
    if (!text.trimStart().startsWith('{')) {
      return;
    }

    messages.push(parseServerMessage(JSON.parse(text)));
  });

  send({
    type: 'session.start',
    token: user.idToken,
    config,
  });

  await waitForMessage(messages, (message) => message.type === 'session.ready');
  await onReady(messages, send);

  return messages;
};

const waitForMessage = async (
  messages: ServerMessage[],
  match: (message: ServerMessage) => boolean,
  timeoutMs = 60_000,
): Promise<ServerMessage> => {
  const existing = messages.find(match);
  if (existing) {
    return existing;
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const found = messages.find(match);
      if (found) {
        clearInterval(interval);
        resolve(found);
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Timed out waiting for expected WS message'));
      }
    }, 100);
  });
};

describe('openai conversation pipeline (e2e)', () => {
  afterEach(async () => {
    await resetEmulatorState();
  });

  it.skipIf(!hasOpenAiKey)(
    'text turn produces assistant transcript and skips TTS when voice disabled',
    async () => {
      const messages = await runWsConversation({
        config: {
          languageCode: 'en',
          mode: 'PushToTalk',
          voiceEnabled: false,
          micMuted: false,
          systemInstruction: 'You are an English teacher. Reply in one short sentence.',
          voice: 'shimmer',
        },
        onReady: async (messages, send) => {
          send({ type: 'user.text', text: 'Say hello to me.' });
          send({ type: 'user.turn.commit', messageId: 'user-1' });
          await waitForMessage(
            messages,
            (message) => message.type === 'transcript.done' && message.role === 'assistant',
          );
          send({ type: 'session.end' });
        },
      });

      const assistantDone = messages.find(
        (message) => message.type === 'transcript.done' && message.role === 'assistant',
      );

      expect(assistantDone?.type === 'transcript.done' ? assistantDone.text.length : 0).toBeGreaterThan(
        0,
      );
      expect(messages.some((message) => message.type === 'usage' && message.stage === 'llm')).toBe(
        true,
      );
      expect(messages.some((message) => message.type === 'usage' && message.stage === 'tts')).toBe(
        false,
      );
    },
  );
});
