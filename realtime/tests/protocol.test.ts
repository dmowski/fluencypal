import { describe, expect, it } from 'vitest';
import { parseBinaryFrame, MAX_AUDIO_CHUNK_BYTES } from '../src/protocol/audioCodec.js';
import {
  parseClientMessage,
  parseServerMessage,
  serializeServerMessage,
  type ClientMessage,
  type ServerMessage,
} from '../src/protocol/messages.js';

const sessionStart: ClientMessage = {
  type: 'session.start',
  token: 'firebase-token',
  config: {
    languageCode: 'en',
    mode: 'RealTimeConversation',
    voiceEnabled: true,
    micMuted: false,
    systemInstruction: 'You are a teacher.',
    voice: 'shimmer',
    conversationId: 'conv-1',
  },
};

const serverMessages: ServerMessage[] = [
  {
    type: 'session.ready',
    sessionId: 'abc',
    mode: 'RealTimeConversation',
    voice: 'shimmer',
    voiceEnabled: true,
    micMuted: false,
  },
  {
    type: 'transcript.delta',
    messageId: 'm1',
    role: 'assistant',
    delta: 'Hello',
  },
  {
    type: 'usage',
    usageId: 'u1',
    stage: 'llm',
    model: 'gpt-4o',
    usageEvent: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
    createdAt: Date.now(),
  },
  { type: 'session.pong' },
  { type: 'session.ended' },
  { type: 'assistant.interrupted' },
];

describe('protocol/messages', () => {
  it('parses session.start', () => {
    expect(parseClientMessage(sessionStart)).toEqual(sessionStart);
  });

  it('rejects invalid client message', () => {
    expect(() => parseClientMessage({ type: 'session.update', patch: {} })).toThrow();
  });

  it('round-trips server messages', () => {
    for (const message of serverMessages) {
      const serialized = serializeServerMessage(message);
      expect(parseServerMessage(JSON.parse(serialized))).toEqual(message);
    }
  });
});

describe('protocol/audioCodec', () => {
  it('accepts raw PCM chunks under max size', () => {
    const payload = Buffer.alloc(320);
    expect(parseBinaryFrame(payload)).toEqual({ kind: 'raw', payload });
  });

  it('parses prefixed audio frames', () => {
    const payload = Buffer.from([1, 2, 3, 4]);
    const frame = Buffer.alloc(5 + payload.length);
    frame[0] = 0x01;
    frame.writeUInt32BE(payload.length, 1);
    payload.copy(frame, 5);

    expect(parseBinaryFrame(frame)).toEqual({ kind: 'audio_in', payload });
  });

  it('rejects oversized chunks', () => {
    const oversized = Buffer.alloc(MAX_AUDIO_CHUNK_BYTES + 1);
    expect(() => parseBinaryFrame(oversized)).toThrow(/max size/);
  });
});
