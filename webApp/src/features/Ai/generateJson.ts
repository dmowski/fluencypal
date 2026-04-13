import { sleep } from '@/libs/sleep';
import {
  AiTextGenerator,
  GenerateJsonAttemptInfo,
  JsonAiRequest,
  StrictJsonAiResponse,
  TextAiJsonError,
} from './types';
import * as Sentry from '@sentry/nextjs';

export const generateJsonResult = async <T>({
  conversationDate,
  parseResponse,
  attemptInfo,
  generate,
}: {
  conversationDate: JsonAiRequest;
  parseResponse: (response: string) => Promise<T>;
  attemptInfo?: GenerateJsonAttemptInfo;
  generate: AiTextGenerator;
}): Promise<StrictJsonAiResponse<T>> => {
  const isAttemptExceeded = attemptInfo && attemptInfo.attempt >= (conversationDate.attempts || 3);
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
    return generateJsonResult({
      conversationDate: { ...conversationDate, cache: false },
      parseResponse,
      attemptInfo: {
        attempt: (attemptInfo?.attempt || 0) + 1,
        error: error instanceof Error ? error : undefined,
        rawOutput: response || attemptInfo?.rawOutput,
      },
      generate,
    });
  }
};
