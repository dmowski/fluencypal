import type { LlmProvider, LlmStreamChunk, ProviderUsage } from '../types.js';
import { getOpenAiClient } from './client.js';

const emptyUsage: ProviderUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

export const openAiLlmProvider: LlmProvider = {
  async *streamChat(options) {
    const client = getOpenAiClient();
    const stream = await client.chat.completions.create(
      {
        model: options.model,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          { role: 'system', content: options.systemMessage },
          ...options.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      },
      { signal: options.signal },
    );

    let usage: ProviderUsage | undefined;

    for await (const chunk of stream) {
      if (options.signal?.aborted) {
        break;
      }

      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield { delta } satisfies LlmStreamChunk;
      }

      if (chunk.usage) {
        usage = {
          input_tokens: chunk.usage.prompt_tokens ?? 0,
          output_tokens: chunk.usage.completion_tokens ?? 0,
          total_tokens: chunk.usage.total_tokens ?? 0,
        };
      }
    }

    return usage ?? emptyUsage;
  },
};
