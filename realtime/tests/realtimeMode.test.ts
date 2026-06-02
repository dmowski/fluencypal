import { describe, expect, it, vi } from 'vitest';
import type { AuthUserInfo } from '../src/auth/types.js';
import { ConversationSession } from '../src/session/ConversationSession.js';
import { createMockProviders } from './helpers/mockProviders.js';

const testUser: AuthUserInfo = { uid: 'user-1', email: 'user@example.com' };

const makeLoudPcmChunk = (amplitude = 5000, sampleCount = 480): Buffer => {
  const buffer = Buffer.alloc(sampleCount * 2);
  for (let i = 0; i < sampleCount; i++) {
    buffer.writeInt16LE(amplitude, i * 2);
  }
  return buffer;
};

describe('ConversationSession RealTimeConversation', () => {
  it('auto-commits a turn after detected silence', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const sent: Array<{ type: string; role?: string }> = [];
    const stt = vi.fn(async () => ({
      text: 'hello there',
      usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
    }));

    const session = new ConversationSession({
      sessionId: 'rtc-1',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: false,
        micMuted: false,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message),
      providers: createMockProviders({
        stt: { transcribeBatch: stt },
      }),
    });

    const loud = makeLoudPcmChunk();
    session.handleBinaryAudio(loud);

    await vi.advanceTimersByTimeAsync(300);
    session.handleBinaryAudio(loud);
    session.handleBinaryAudio(Buffer.alloc(loud.length));

    await vi.advanceTimersByTimeAsync(1300);
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }

    expect(stt).toHaveBeenCalled();
    expect(sent.some((message) => message.type === 'transcript.done' && message.role === 'user')).toBe(
      true,
    );
    expect(sent.some((message) => message.type === 'transcript.done' && message.role === 'assistant')).toBe(
      true,
    );

    vi.useRealTimers();
  });
});
