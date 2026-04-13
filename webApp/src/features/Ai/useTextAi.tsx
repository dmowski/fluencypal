'use client';
import { createContext, useContext, ReactNode, JSX } from 'react';
import { sendTextAiRequest } from './sendTextAiRequest';
import { getDataFromCache, setDataToCache } from '@/libs/localStorageCache';
import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import {
  TextAiContextType,
  TextAiRequest,
  JsonAiRequest,
  StrictJsonAiResponse,
  GenerateStrictJsonFunction,
  StrictJsonAiRequest,
  AiTextGenerator,
} from './types';
import { parseJson, parseStrictJson } from './jsonParser';
import { generateJsonResult } from './generateJson';

const cacheKey = `DL_text-ai-cache`;

const TextAiContext = createContext<TextAiContextType | null>(null);

function useProvideTextAi(): TextAiContextType {
  const auth = useAuth();
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';

  const generate: AiTextGenerator = async (conversationDate: TextAiRequest) => {
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

  const generateJson = async <T,>(conversationDate: JsonAiRequest): Promise<T> => {
    const result = await generateJsonResult({
      conversationDate,
      parseResponse: (response) => parseJson<T>({ json: response, generate, languageCode }),
      generate,
    });
    return result.parsed;
  };

  const generateStrictJson: GenerateStrictJsonFunction = async <T,>(
    conversationDate: StrictJsonAiRequest<T>,
  ): Promise<StrictJsonAiResponse<T>> => {
    return generateJsonResult({
      conversationDate,
      parseResponse: (response) =>
        parseStrictJson({
          json: response,
          schema: conversationDate.schema,
          generate,
          languageCode,
        }),
      generate,
    });
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
    throw new Error('useTextAi must be used within a TextAiProvider');
  }
  return context;
};
