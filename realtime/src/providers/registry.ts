import { modelConfig } from '../config/models.js';
import { openAiLlmProvider } from './openai/llm.js';
import { openAiSttProvider } from './openai/stt.js';
import { openAiTtsProvider } from './openai/tts.js';
import type { ProviderRegistry } from './types.js';

export const defaultProviderRegistry: ProviderRegistry = {
  stt: openAiSttProvider,
  llm: openAiLlmProvider,
  tts: openAiTtsProvider,
};

export const getModelConfig = () => modelConfig;
