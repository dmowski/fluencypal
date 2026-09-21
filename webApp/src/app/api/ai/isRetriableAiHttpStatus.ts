/**
 * Client-safe HTTP retry helper. Keep this module free of `openai` imports:
 * `openAiErrors` pulls the OpenAI SDK, whose lookbehind regex literals crash
 * Safari 15.4–16.3 as soon as the chunk parses (DARK-LANG-DF).
 */
export const isRetriableAiHttpStatus = (status: number): boolean =>
  status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
