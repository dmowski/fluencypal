import { describe, expect, it, vi } from 'vitest';
import type { AuthUserInfo } from '../src/auth/types.js';
import { ConversationSession } from '../src/session/ConversationSession.js';
import { defaultTurnDetectorConfig } from '../src/session/turnDetection.js';
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
        micEnabled: true,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message),
      providers: createMockProviders({
        stt: { transcribeBatch: stt },
      }),
    });

    const loud = makeLoudPcmChunk(5000, 2400);
    for (let i = 0; i < 10; i++) {
      session.handleBinaryAudio(loud);
      await vi.advanceTimersByTimeAsync(50);
    }

    session.handleBinaryAudio(Buffer.alloc(loud.length));
    await vi.advanceTimersByTimeAsync(defaultTurnDetectorConfig.silenceMs + 100);
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
        micEnabled: true,
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
        micEnabled: true,
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

  it('does not interrupt when user speaks after the estimated playback window ends', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const sent: Array<{ type: string }> = [];
    const session = new ConversationSession({
      sessionId: 'rtc-playback-idle',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micEnabled: true,
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

    sent.length = 0;
    await vi.advanceTimersByTimeAsync(500);
    session.handleBinaryAudio(makeLoudPcmChunk());

    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(false);

    vi.useRealTimers();
  });

  it('commits a user turn after greeting playback when the user speaks', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const sent: Array<{ type: string; role?: string }> = [];
    const stt = vi.fn(async () => ({
      text: 'Hello',
      usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
    }));

    const session = new ConversationSession({
      sessionId: 'rtc-post-greeting',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micEnabled: true,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message),
      providers: createMockProviders({
        stt: { transcribeBatch: stt },
        tts: {
          async *synthesizeStream() {
            yield Buffer.from('fake-mp3-audio');
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    await session.handleClientMessage({ type: 'assistant.trigger' });
    sent.length = 0;

    await vi.advanceTimersByTimeAsync(500);

    const loud = makeLoudPcmChunk(5000, 2400);
    for (let i = 0; i < 8; i++) {
      session.handleBinaryAudio(loud);
      await vi.advanceTimersByTimeAsync(50);
    }

    session.handleBinaryAudio(Buffer.alloc(loud.length));
    await vi.advanceTimersByTimeAsync(defaultTurnDetectorConfig.silenceMs + 100);
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }

    expect(stt).toHaveBeenCalled();
    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(false);
    expect(sent.some((message) => message.type === 'transcript.done' && message.role === 'user')).toBe(
      true,
    );

    vi.useRealTimers();
  });

  it('does not treat mic tail as barge-in during the post-TTS grace window', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const sent: Array<{ type: string }> = [];
    const session = new ConversationSession({
      sessionId: 'rtc-grace',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micEnabled: true,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message),
      providers: createMockProviders({
        tts: {
          async *synthesizeStream() {
            yield Buffer.alloc(12_800);
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    await session.handleClientMessage({ type: 'assistant.trigger' });

    sent.length = 0;
    session.handleBinaryAudio(makeLoudPcmChunk());
    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(false);

    await vi.advanceTimersByTimeAsync(500);
    session.handleBinaryAudio(makeLoudPcmChunk());
    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(false);

    vi.useRealTimers();
  });

  it('does not commit echo audio as a user turn during estimated assistant playback', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const sent: Array<{ type: string; role?: string }> = [];
    const session = new ConversationSession({
      sessionId: 'rtc-echo',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micEnabled: true,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message as { type: string; role?: string }),
      providers: createMockProviders({
        tts: {
          async *synthesizeStream() {
            yield Buffer.alloc(12_800);
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    await session.handleClientMessage({ type: 'assistant.trigger' });

    sent.length = 0;
    const loud = makeLoudPcmChunk();
    session.handleBinaryAudio(loud);
    session.handleBinaryAudio(Buffer.alloc(loud.length));

    await vi.advanceTimersByTimeAsync(defaultTurnDetectorConfig.silenceMs + 200);

    expect(sent.filter((message) => message.type === 'transcript.done' && message.role === 'user')).toHaveLength(
      0,
    );

    vi.useRealTimers();
  });

  it('does not abort TTS while waiting for the first audio chunk after LLM text', async () => {
    const sent: Array<{ type: string }> = [];
    let releaseTts: () => void = () => {};
    const ttsGate = new Promise<void>((resolve) => {
      releaseTts = resolve;
    });

    const session = new ConversationSession({
      sessionId: 'rtc-tts-wait',
      user: testUser,
      config: {
        languageCode: 'en',
        mode: 'RealTimeConversation',
        voiceEnabled: true,
        micEnabled: true,
        systemInstruction: 'Teach English.',
        voice: 'shimmer',
      },
      send: (message) => sent.push(message),
      providers: createMockProviders({
        tts: {
          async *synthesizeStream() {
            await ttsGate;
            yield Buffer.from('fake-mp3-audio');
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
    });

    const generatePromise = session.handleClientMessage({ type: 'assistant.trigger' });

    const waitForAssistantText = async (): Promise<void> => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (
          sent.some(
            (message) =>
              message.type === 'transcript.done' &&
              (message as { role?: string }).role === 'assistant',
          )
        ) {
          return;
        }
        await Promise.resolve();
      }

      throw new Error('Timed out waiting for assistant transcript');
    };

    await waitForAssistantText();

    sent.length = 0;
    session.handleBinaryAudio(makeLoudPcmChunk());
    expect(sent.some((message) => message.type === 'assistant.interrupted')).toBe(false);

    releaseTts();
    await generatePromise;

    expect(sent.some((message) => message.type === 'assistant.speaking')).toBe(true);
  });
});
