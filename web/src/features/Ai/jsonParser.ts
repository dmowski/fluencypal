import { jsonrepair } from 'jsonrepair';
import { SupportedLanguage } from '../Lang/lang';
import { AiTextGenerator } from './types';
import * as Sentry from '@sentry/nextjs';
import z from 'zod';

export const parseStrictJson = async <T>({
  json,
  schema,
  generate,
  languageCode,
}: {
  json: string;
  schema: z.ZodType<T>;
  generate: AiTextGenerator;
  languageCode: SupportedLanguage;
}): Promise<T> => {
  const parsed = await parseJson<unknown>({ json, generate, languageCode });
  return schema.parse(parsed);
};

export const fixJson = async <T>({
  badJson,
  error,
  generate,
  languageCode,
}: {
  badJson: string;
  error: string;
  generate: AiTextGenerator;
  languageCode: SupportedLanguage;
}): Promise<T> => {
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

export const parseJson = async <T>({
  json,
  generate,
  languageCode,
}: {
  json: string;
  generate: AiTextGenerator;
  languageCode: SupportedLanguage;
}): Promise<T> => {
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

    const fixedJson = await fixJson<T>({
      badJson: json,
      error: error + '',
      generate,
      languageCode,
    });
    return fixedJson;
  }
};
