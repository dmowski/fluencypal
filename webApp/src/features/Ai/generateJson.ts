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
    const maxAttempts = conversationDate.attempts || 3;
    const nextAttempt = (attemptInfo?.attempt || 0) + 1;
    const status = (error as Error & { status?: number }).status;
    console.error('[generateJson] failed', {
      model: conversationDate.model,
      attempt: nextAttempt,
      maxAttempts,
      status,
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined,
      rawOutputPreview: response.slice(0, 500),
    });
    if (nextAttempt >= maxAttempts) {
      Sentry.captureException(error, {
        extra: {
          title: 'Error generating JSON in useTextAi',
          attempts: nextAttempt,
          model: conversationDate.model,
          status,
          rawOutput: response.slice(0, 2000),
        },
      });
    }
    await sleep(500);
    console.log('Retrying AI JSON generation, attempt:', nextAttempt);
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
