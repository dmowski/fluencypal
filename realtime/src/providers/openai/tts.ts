import type { TtsProvider, ProviderUsage } from '../types.js';
import { getOpenAiClient } from './client.js';

const estimateTtsUsage = (text: string): ProviderUsage => {
  const tokens = Math.max(1, Math.ceil(text.length / 4));
  return {
    input_tokens: tokens,
    output_tokens: 0,
    total_tokens: tokens,
  };
};

export const openAiTtsProvider: TtsProvider = {
  async *synthesizeStream(text, options) {
    if (!text.trim()) {
      return estimateTtsUsage(text);
    }

    const client = getOpenAiClient();
    const response = await client.audio.speech.create(
      {
        model: options.model,
        voice: options.voice,
        input: text,
        response_format: 'mp3',
      },
      { signal: options.signal },
    );

    if (!response.body) {
      return estimateTtsUsage(text);
    }

    const reader = response.body.getReader();
    try {
      while (true) {
        if (options.signal?.aborted) {
          await reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        if (value) {
          yield Buffer.from(value);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return estimateTtsUsage(text);
  },
};
