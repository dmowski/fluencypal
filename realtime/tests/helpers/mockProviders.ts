import type { ProviderRegistry, ProviderUsage } from '../../src/providers/types.js';

const defaultUsage: ProviderUsage = {
  input_tokens: 1,
  output_tokens: 1,
  total_tokens: 2,
};

export const createMockProviders = (overrides?: Partial<ProviderRegistry>): ProviderRegistry => ({
  stt: {
    transcribeBatch: async () => ({ text: 'transcribed speech', usage: defaultUsage }),
  },
  llm: {
    async *streamChat() {
      yield { delta: 'Hello!' };
      return defaultUsage;
    },
  },
  tts: {
    async *synthesizeStream() {
      yield Buffer.from('fake-audio');
      return defaultUsage;
    },
  },
  ...overrides,
});
