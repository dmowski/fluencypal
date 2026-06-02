import OpenAI from 'openai';
import { env } from '../../config/env.js';

let client: OpenAI | null = null;

export const getOpenAiClient = (): OpenAI => {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required');
  }

  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  return client;
};

export const resetOpenAiClientForTests = (): void => {
  client = null;
};
