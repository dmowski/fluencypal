import z from 'zod';
import { TextAiModel } from './ai';
import { SupportedLanguage } from '../Lang/lang';

export interface TextAiRequest {
  userMessage: string;
  systemMessage: string;
  model: TextAiModel;
  cache?: boolean;
  languageCode?: SupportedLanguage;
}

export interface JsonAiRequest extends TextAiRequest {
  attempts?: number;
}

export interface StrictJsonAiRequest<T> extends JsonAiRequest {
  schema: z.ZodType<T>;
}

export interface StrictJsonAiResponse<T> {
  parsed: T;
  rawOutput: string;
}

export interface GenerateStrictJsonFunction {
  <T>(conversationDate: StrictJsonAiRequest<T>): Promise<StrictJsonAiResponse<T>>;
}

export class TextAiJsonError extends Error {
  rawOutput?: string;
  attempts?: number;

  constructor(
    message: string,
    options?: { rawOutput?: string; attempts?: number; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'TextAiJsonError';
    this.rawOutput = options?.rawOutput;
    this.attempts = options?.attempts;
  }
}

export interface TextAiContextType {
  generate: (conversationDate: TextAiRequest) => Promise<string>;
  generateJson: <T>(conversationDate: JsonAiRequest) => Promise<T>;
  generateStrictJson: GenerateStrictJsonFunction;
}

export type AiTextGenerator = (conversationDate: TextAiRequest) => Promise<string>;

export interface GenerateJsonAttemptInfo {
  attempt: number;
  error?: Error;
  rawOutput?: string;
}
