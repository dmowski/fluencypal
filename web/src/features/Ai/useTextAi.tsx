'use client';
import { createContext, useContext, ReactNode, JSX } from 'react';
import * as Sentry from '@sentry/nextjs';
import { sendTextAiRequest } from './sendTextAiRequest';
import { TextAiModel } from '@/features/Ai/ai';
import { getDataFromCache, setDataToCache } from '@/libs/localStorageCache';
import { useAuth } from '../Auth/useAuth';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useSettings } from '../Settings/useSettings';
import { sleep } from '@/libs/sleep';
import { jsonrepair } from 'jsonrepair';
import { z } from 'zod';

const cacheKey = `DL_text-ai-cache`;

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

interface TextAiContextType {
  generate: (conversationDate: TextAiRequest) => Promise<string>;
  generateJson: <T>(conversationDate: JsonAiRequest) => Promise<T>;
  generateStrictJson: GenerateStrictJsonFunction;
}

const TextAiContext = createContext<TextAiContextType | null>(null);

function useProvideTextAi(): TextAiContextType {
  const auth = useAuth();
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';

  const generate = async (conversationDate: TextAiRequest) => {
    const valueForCache = conversationDate.userMessage + conversationDate.systemMessage;

    if (conversationDate.cache) {
      const responseFromCache = await getDataFromCache({
        inputValue: valueForCache,
        storageSpace: cacheKey,
      });
      if (responseFromCache) {
        return responseFromCache;
      }
    }

    const response = await sendTextAiRequest(
      {
        ...conversationDate,
        languageCode: conversationDate.languageCode || languageCode,
      },
      await auth.getToken(),
    );

    const responseString = response.aiResponse || '';

    if (conversationDate.cache && responseString) {
      await setDataToCache({
        inputValue: valueForCache,
        outputValue: responseString,
        storageSpace: cacheKey,
      });
    }

    return responseString;
  };

  const parseJson = async <T,>(json: string): Promise<T> => {
    try {
      let trimmedJson = json.trim();
      const isAbleToFixWithoutAi = trimmedJson.startsWith('```json') && trimmedJson.endsWith('```');
      if (isAbleToFixWithoutAi) {
        trimmedJson = trimmedJson.slice(7, -3).trim();
      }

      const repairedJson = jsonrepair(trimmedJson);
      return JSON.parse(repairedJson);
    } catch (error) {
      console.error('Error parsing JSON. error:', error + '');
      console.error('Error parsing JSON. json:', json);
      console.log(json);
      Sentry.captureException(error, {
        extra: {
          title:
            'Error parsing JSON in useTextAi | First attempt to parse JSON failed, trying to fix it with AI',
          json,
        },
      });

      const fixedJson = await fixJson<T>(json, error + '');
      return fixedJson;
    }
  };

  const parseStrictJson = async <T,>(json: string, schema: z.ZodType<T>): Promise<T> => {
    const parsed = await parseJson<unknown>(json);
    return schema.parse(parsed);
  };

  const fixJson = async <T,>(badJson: string, error: string): Promise<T> => {
    const systemMessage = [
      'Given JSON with some json mistakes.',
      'Please fix json and return the fixed JSON.',
      'Error: ' + error,
      'Return only the correct JSON, nothing else. No wrappers, no explanations, your response will be passed into javascript JSON.parse() function',
    ].join('\n');

    const fixJsonRes = await generate({
      systemMessage,
      userMessage: badJson,
      model: 'gpt-4o',
      languageCode,
    });
    try {
      let trimmedJson = fixJsonRes.trim();
      const isAbleToFixWithoutAi = trimmedJson.startsWith('```json') && trimmedJson.endsWith('```');
      if (isAbleToFixWithoutAi) {
        trimmedJson = trimmedJson.slice(7, -3).trim();
      }

      return JSON.parse(trimmedJson);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          title: 'Error parsing fixed json in useFixJson',
        },
      });
      throw error;
    }
  };

  interface AttemptInfo {
    attempt: number;
    error?: Error;
    rawOutput?: string;
  }

  const generateJsonResult = async <T,>(
    conversationDate: JsonAiRequest,
    parseResponse: (response: string) => Promise<T>,
    attemptInfo?: AttemptInfo,
  ): Promise<StrictJsonAiResponse<T>> => {
    const isAttemptExceeded =
      attemptInfo && attemptInfo.attempt >= (conversationDate.attempts || 3);
    if (isAttemptExceeded) {
      throw new TextAiJsonError('AI JSON generation: Max attempts exceeded', {
        rawOutput: attemptInfo.rawOutput,
        attempts: attemptInfo.attempt,
        cause: attemptInfo.error,
      });
    }

    let response = '';
    try {
      response = await generate(conversationDate);
      const parsed = await parseResponse(response);

      return {
        parsed,
        rawOutput: response,
      };
    } catch (error) {
      console.error('Error generating JSON. error', error);
      Sentry.captureException(error, {
        extra: {
          title: 'Error generating JSON in useTextAi',
        },
      });
      await sleep(500);
      console.log('Retrying AI JSON generation, attempt:', (attemptInfo?.attempt || 0) + 1);
      return generateJsonResult({ ...conversationDate, cache: false }, parseResponse, {
        attempt: (attemptInfo?.attempt || 0) + 1,
        error: error instanceof Error ? error : undefined,
        rawOutput: response || attemptInfo?.rawOutput,
      });
    }
  };

  const generateJson = async <T,>(conversationDate: JsonAiRequest): Promise<T> => {
    const result = await generateJsonResult(conversationDate, (response) => parseJson<T>(response));
    return result.parsed;
  };

  const generateStrictJson: GenerateStrictJsonFunction = async <T,>(
    conversationDate: StrictJsonAiRequest<T>,
  ): Promise<StrictJsonAiResponse<T>> => {
    return generateJsonResult(conversationDate, (response) =>
      parseStrictJson(response, conversationDate.schema),
    );
  };

  return {
    generate,
    generateJson,
    generateStrictJson,
  };
}

export function TextAiProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideTextAi();
  return <TextAiContext.Provider value={hook}>{children}</TextAiContext.Provider>;
}

export const useTextAi = (): TextAiContextType => {
  const context = useContext(TextAiContext);
  if (!context) {
    throw new Error('useTextAi must be used within a UsageProvider');
  }
  return context;
};
