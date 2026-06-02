import { env } from './env.js';

export const modelConfig = {
  stt: env.DEFAULT_STT_MODEL,
  llm: env.DEFAULT_LLM_MODEL,
  tts: env.DEFAULT_TTS_MODEL,
} as const;
