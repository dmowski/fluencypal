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

  it('interrupts in-flight assistant output when user speaks during pipeline busy', async () => {
    let resolveLlm: () => void = () => {};
    const llmGate = new Promise<void>((resolve) => {
      resolveLlm = resolve;
    });

    const sent: Array<{ type: string }> = [];
    const session = new ConversationSession({
      sessionId: 'rtc-barge',
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
        llm: {
          async *streamChat() {
            yield { delta: 'Hello' };
            await llmGate;
            yield { delta: ' world' };
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    const assistantPromise = session.handleClientMessage({ type: 'assistant.trigger' });
    await Promise.resolve();

    session.handleBinaryAudio(makeLoudPcmChunk());

    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(true);

    resolveLlm();
    await assistantPromise;

    expect(
      sent.filter(
        (message) =>
          message.type === 'transcript.done' &&
          (message as { role?: string }).role === 'assistant',
      ),
    ).toHaveLength(0);
  });

  it('barge-in during busy pipeline fires at most once until the pipeline is idle', async () => {
    let resolveLlm: () => void = () => {};
    const llmGate = new Promise<void>((resolve) => {
      resolveLlm = resolve;
    });

    const sent: Array<{ type: string }> = [];
    const session = new ConversationSession({
      sessionId: 'rtc-barge-once',
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
        llm: {
          async *streamChat() {
            yield { delta: 'Hello' };
            await llmGate;
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    const assistantPromise = session.handleClientMessage({ type: 'assistant.trigger' });
    await Promise.resolve();

    const loud = makeLoudPcmChunk();
    session.handleBinaryAudio(loud);
    session.handleBinaryAudio(loud);
    session.handleBinaryAudio(loud);

    expect(sent.filter((message) => message.type === 'assistant.interrupted')).toHaveLength(1);

    resolveLlm();
    await assistantPromise;
  });

  it('sends assistant.interrupted when user speaks after TTS finished but output is still active', async () => {
    const sent: Array<{ type: string }> = [];
    const session = new ConversationSession({
      sessionId: 'rtc-playback-barge',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micMuted: false,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message),
      providers: createMockProviders({
        tts: {
          async *synthesizeStream() {
            yield Buffer.from('fake-mp3-audio');
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    await session.handleClientMessage({ type: 'assistant.trigger' });

    expect(sent.some((message) => message.type === 'assistant.speaking')).toBe(true);
    expect(
      sent.some(
        (message) =>
          message.type === 'transcript.done' &&
          (message as { role?: string }).role === 'assistant',
      ),
    ).toBe(true);

    sent.length = 0;
    session.handleBinaryAudio(makeLoudPcmChunk());

    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(true);
  });
});
