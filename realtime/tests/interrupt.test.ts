import { describe, expect, it } from 'vitest';
import type { LlmStreamChunk, ProviderUsage } from '../src/providers/types.js';
import { ConversationHistory } from '../src/session/history.js';
import type { SessionRuntimeConfig } from '../src/session/ConversationSession.js';
import { TurnPipeline } from '../src/session/TurnPipeline.js';
import { createMockProviders } from './helpers/mockProviders.js';

const defaultUsage: ProviderUsage = {
  input_tokens: 1,
  output_tokens: 1,
  total_tokens: 2,
};

const baseConfig: SessionRuntimeConfig = {
  languageCode: 'en',
  mode: 'RealTimeConversation',
  voiceEnabled: false,
  micEnabled: true,
  systemInstruction: 'Teach English.',
  voice: 'shimmer',
  correctionInstruction: '',
};

describe('assistant interrupt (barge-in)', () => {
  it('abortAssistantOutput stops in-flight LLM and clears queued generations', async () => {
    let resolveLlmGate: () => void = () => {};
    const llmGate = new Promise<void>((resolve) => {
      resolveLlmGate = resolve;
    });

    const sent: Array<{ type: string; role?: string }> = [];
    const history = new ConversationHistory();
    history.append({ id: 'u1', role: 'user', text: 'Hi', createdAt: Date.now() });

    const pipeline = new TurnPipeline(
      createMockProviders({
        llm: {
          async *streamChat() {
            await llmGate;
            yield { delta: 'After interrupt' } satisfies LlmStreamChunk;
            return defaultUsage;
          },
        },
      }),
      { send: (message) => sent.push(message), sendBinary: () => {} },
      () => baseConfig,
      history,
      new AbortController().signal,
    );

    const generatePromise = pipeline.generateAssistantResponse();
    await Promise.resolve();

    expect(pipeline.isBusy).toBe(true);
    expect(pipeline.abortAssistantOutput()).toBe(true);
    expect(sent.some((m) => m.type === 'transcript.delta')).toBe(false);

    resolveLlmGate();
    await generatePromise;

    expect(sent.filter((m) => m.type === 'transcript.done' && m.role === 'assistant')).toHaveLength(0);
    expect(history.list().some((m) => m.role === 'assistant')).toBe(false);
  });

  it('does not start a stale queued generation after interrupt', async () => {
    const sent: Array<{ type: string; role?: string }> = [];
    const history = new ConversationHistory();
    history.append({ id: 'u1', role: 'user', text: 'Hi', createdAt: Date.now() });

    let call = 0;
    const pipeline = new TurnPipeline(
      createMockProviders({
        llm: {
          async *streamChat() {
            call += 1;
            if (call === 1) {
              yield { delta: 'Partial' };
              await new Promise((resolve) => setTimeout(resolve, 30));
            }
            yield { delta: 'Done' };
            return defaultUsage;
          },
        },
      }),
      { send: (message) => sent.push(message), sendBinary: () => {} },
      () => baseConfig,
      history,
      new AbortController().signal,
    );

    const first = pipeline.generateAssistantResponse();
    await Promise.resolve();
    pipeline.abortAssistantOutput();
    await first;

    history.append({ id: 'u2', role: 'user', text: 'Again', createdAt: Date.now() });
    await pipeline.generateAssistantResponse();

    const assistantTexts = sent
      .filter((m) => m.type === 'transcript.done' && m.role === 'assistant')
      .map((m) => (m as { text?: string }).text);
    expect(assistantTexts).toEqual(['Done']);
    expect(call).toBe(2);
  });
});
