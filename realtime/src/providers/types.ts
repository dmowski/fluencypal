import type { AiVoice, SupportedLanguage, UsageEventPayload } from '../protocol/messages.js';

export type ProviderUsage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
};

export type SttResult = {
  text: string;
  usage: ProviderUsage;
};

export type SttOptions = {
  languageCode: SupportedLanguage;
  model: string;
  signal?: AbortSignal;
};

export type LlmMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type LlmOptions = {
  systemMessage: string;
  messages: LlmMessage[];
  model: string;
  signal?: AbortSignal;
};

export type LlmStreamChunk = {
  delta: string;
  usage?: ProviderUsage;
};

export type TtsOptions = {
  voice: AiVoice;
  model: string;
  signal?: AbortSignal;
};

export interface SttProvider {
  transcribeBatch(audioPcm16: Buffer, options: SttOptions): Promise<SttResult>;
}

export interface LlmProvider {
  streamChat(options: LlmOptions): AsyncGenerator<LlmStreamChunk, ProviderUsage | undefined>;
}

export interface TtsProvider {
  synthesizeStream(text: string, options: TtsOptions): AsyncGenerator<Buffer, ProviderUsage | undefined>;
}

export type ProviderRegistry = {
  stt: SttProvider;
  llm: LlmProvider;
  tts: TtsProvider;
};

export const toUsageEventPayload = (usage: ProviderUsage): UsageEventPayload => ({
  input_tokens: usage.input_tokens,
  output_tokens: usage.output_tokens,
  total_tokens: usage.total_tokens,
});
