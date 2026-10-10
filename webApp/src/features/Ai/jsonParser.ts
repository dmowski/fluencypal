import { jsonrepair } from 'jsonrepair';
import { SupportedLanguage } from '../Lang/lang';
import { AiTextGenerator } from './types';
import * as Sentry from '@sentry/nextjs';
import z, { ZodError } from 'zod';

const extractFencedJson = (trimmed: string): string | null => {
  if (!trimmed.startsWith('```')) return null;
  const firstLineBreak = trimmed.indexOf('\n');
  if (firstLineBreak === -1) return null;
  const closeFenceIndex = trimmed.indexOf('\n```', firstLineBreak);
  if (closeFenceIndex === -1) return null;
  return trimmed.slice(firstLineBreak + 1, closeFenceIndex).trim();
};

/** First `{...}` or `[...]` starting at `start`, respecting strings. */
const extractBalancedJson = (raw: string, start: number): string | null => {
  const opener = raw[start];
  if (opener !== '{' && opener !== '[') return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < raw.length; index++) {
    const char = raw[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{' || char === '[') depth += 1;
    if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) return raw.slice(start, index + 1);
    }
  }

  return null;
};

const parsesAsJson = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    try {
      JSON.parse(jsonrepair(value));
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * jsonrepair turns "sentence, more text? { ... }" into an array.
 * Pull the JSON value out of that prose instead.
 */
const extractEmbeddedJson = (raw: string): string | null => {
  for (let index = 0; index < raw.length; index++) {
    if (raw[index] !== '{' && raw[index] !== '[') continue;
    const balanced = extractBalancedJson(raw, index);
    if (!balanced) continue;
    if (parsesAsJson(balanced)) return balanced;
    index += balanced.length - 1;
  }
  return null;
};

export const extractJsonFromAiResponse = (raw: string): string => {
  const trimmed = raw.trim();
  const candidate = extractFencedJson(trimmed) ?? trimmed;

  if (candidate.startsWith('{') || candidate.startsWith('[')) {
    return extractBalancedJson(candidate, 0) ?? candidate;
  }

  return extractEmbeddedJson(candidate) ?? candidate;
};

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
  try {
    return schema.parse(parsed);
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    try {
      const fixed = await fixJson<unknown>({
        badJson: JSON.stringify(parsed),
        error: error.message,
        generate,
        languageCode,
      });
      return schema.parse(fixed);
    } catch {
      throw error;
    }
  }
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
    model: 'gpt-5.6-luna',
    languageCode,
  });
  console.log('fixJsonRes', fixJsonRes);
  try {
    const trimmedJson = extractJsonFromAiResponse(fixJsonRes);
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
    const trimmedJson = extractJsonFromAiResponse(json);
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
