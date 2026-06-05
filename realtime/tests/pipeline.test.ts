import { describe, expect, it, vi } from 'vitest';
import type { ProviderRegistry } from '../src/providers/types.js';
import { isAbortError } from '../src/errors/isAbortError.js';
import { TurnPipeline } from '../src/session/TurnPipeline.js';
import { ConversationHistory } from '../src/session/history.js';
import type { SessionRuntimeConfig } from '../src/session/ConversationSession.js';
import { createMockProviders } from './helpers/mockProviders.js';

const baseConfig: SessionRuntimeConfig = {
  languageCode: 'en',
  mode: 'PushToTalk',
  voiceEnabled: true,
  micEnabled: true,
  systemInstruction: 'You are a teacher.',
  voice: 'shimmer',
  correctionInstruction: '',
};

describe('TurnPipeline', () => {
  it('runs STT → LLM → TTS and emits usage events', async () => {
    const sent: unknown[] = [];
    const binary: Buffer[] = [];
    const history = new ConversationHistory();
    history.append({ id: 'u1', role: 'user', text: 'Hi', createdAt: Date.now() });

    const providers = createMockProviders();
    const pipeline = new TurnPipeline(
      providers,
      {
        send: (message) => sent.push(message),
        sendBinary: (chunk) => binary.push(chunk),
      },
      () => baseConfig,
      history,
      new AbortController().signal,
    );

    await pipeline.generateAssistantResponse();

    expect(sent.some((message) => (message as { type?: string }).type === 'transcript.done')).toBe(
      true,
    );
    expect(sent.some((message) => (message as { type?: string }).type === 'usage')).toBe(true);
    expect(binary.length).toBeGreaterThan(0);
    expect(history.list().some((message) => message.role === 'assistant')).toBe(true);
  });

  it('emits assistant.speaking only after the first TTS binary chunk', async () => {
    const sent: Array<{ type: string; active?: boolean }> = [];
    const binary: Buffer[] = [];
    const history = new ConversationHistory();
    history.append({ id: 'u1', role: 'user', text: 'Hi', createdAt: Date.now() });

    let releaseTts: () => void = () => {};
    const ttsGate = new Promise<void>((resolve) => {
      releaseTts = resolve;
    });

    const pipeline = new TurnPipeline(
      createMockProviders({
        tts: {
          async *synthesizeStream() {
            await ttsGate;
            yield Buffer.from('fake-audio');
            return { input_tokens: 1, output_tokens: 1, total_tokens: 2 };
          },
        },
      }),
      {
        send: (message) => sent.push(message as { type: string; active?: boolean }),
        sendBinary: (chunk) => binary.push(chunk),
      },
      () => baseConfig,
      history,
      new AbortController().signal,
    );

    const generatePromise = pipeline.generateAssistantResponse();
    await Promise.resolve();

    expect(sent.some((message) => message.type === 'assistant.speaking')).toBe(false);

    releaseTts();
    await generatePromise;

    const speakingMessages = sent.filter((message) => message.type === 'assistant.speaking');
    expect(speakingMessages.map((message) => message.active)).toEqual([true, false]);
    expect(binary).toHaveLength(1);

    const speakingIndex = sent.findIndex((message) => message.type === 'assistant.speaking');
    expect(speakingIndex).toBeGreaterThan(-1);
    expect(sent.slice(0, speakingIndex).some((message) => message.type === 'transcript.done')).toBe(
      true,
    );
  });

  it('skips TTS when voice is disabled', async () => {
    const binary: Buffer[] = [];
    const history = new ConversationHistory();
    history.append({ id: 'u1', role: 'user', text: 'Hi', createdAt: Date.now() });

    const pipeline = new TurnPipeline(
      createMockProviders(),
      {
        send: () => {},
        sendBinary: (chunk) => binary.push(chunk),
      },
      () => ({ ...baseConfig, voiceEnabled: false }),
      history,
      new AbortController().signal,
    );

    await pipeline.generateAssistantResponse();
    expect(binary).toHaveLength(0);
  });

  it('transcribes buffered pcm audio via STT provider', async () => {
    const stt = vi.fn(async () => ({
      text: 'hello there',
      usage: { input_tokens: 2, output_tokens: 1, total_tokens: 3 },
    }));

    const providers: ProviderRegistry = createMockProviders({
      stt: { transcribeBatch: stt },
    });

    const pipeline = new TurnPipeline(
      providers,
      { send: () => {}, sendBinary: () => {} },
      () => baseConfig,
      new ConversationHistory(),
      new AbortController().signal,
    );

    const text = await pipeline.transcribeAudio([Buffer.from([0, 0, 0, 0])]);
    expect(text).toBe('hello there');
    expect(stt).toHaveBeenCalledTimes(1);
  });

  it('does not throw when LLM stream is aborted (APIUserAbortError)', async () => {
    const abortError = Object.assign(new Error('Request was aborted.'), {
      name: 'APIUserAbortError',
    });
    expect(isAbortError(abortError)).toBe(true);

    const providers = createMockProviders({
      llm: {
        async *streamChat() {
          throw abortError;
        },
      },
    });

    const history = new ConversationHistory();
    history.append({ id: 'u1', role: 'user', text: 'Hi', createdAt: Date.now() });

    const pipeline = new TurnPipeline(
      providers,
      { send: () => {}, sendBinary: () => {} },
      () => baseConfig,
      history,
      new AbortController().signal,
    );

    await expect(pipeline.generateAssistantResponse()).resolves.toBeUndefined();
  });
});
