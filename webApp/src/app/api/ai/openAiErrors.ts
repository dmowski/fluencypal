import { APIConnectionError, APIConnectionTimeoutError, APIError } from 'openai';

export const isTransientOpenAiError = (error: unknown): boolean => {
  if (error instanceof APIConnectionError || error instanceof APIConnectionTimeoutError) {
    return true;
  }

  if (error instanceof APIError) {
    const status = error.status ?? 0;
    return status === 408 || status === 409 || status === 429 || status >= 500;
  }

  return false;
};

export const createOpenAiUnavailableResponse = (): Response =>
  Response.json(
    { error: 'AI service temporarily unavailable. Please try again.' },
    { status: 503, headers: { 'Retry-After': '2' } },
  );

export const isRetriableAiHttpStatus = (status: number): boolean =>
  status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
