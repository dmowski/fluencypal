import { InternalServerError, RateLimitError } from 'openai';
import {
  createOpenAiUnavailableResponse,
  isRetriableAiHttpStatus,
  isTransientOpenAiError,
} from './openAiErrors';

describe('openAiErrors', () => {
  it('treats OpenAI 500 and 429 responses as transient', () => {
    const serverError = new InternalServerError(
      500,
      undefined,
      'The server had an error while processing your request.',
      new Headers(),
    );
    const rateLimitError = new RateLimitError(429, undefined, 'Rate limit exceeded', new Headers());

    expect(isTransientOpenAiError(serverError)).toBe(true);
    expect(isTransientOpenAiError(rateLimitError)).toBe(true);
  });

  it('does not treat arbitrary errors as transient OpenAI failures', () => {
    expect(isTransientOpenAiError(new Error('boom'))).toBe(false);
  });

  it('marks retriable HTTP statuses for client retries', () => {
    expect(isRetriableAiHttpStatus(503)).toBe(true);
    expect(isRetriableAiHttpStatus(500)).toBe(true);
    expect(isRetriableAiHttpStatus(400)).toBe(false);
  });

  it('returns a 503 response with Retry-After', async () => {
    const response = createOpenAiUnavailableResponse();
    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('2');
    await expect(response.json()).resolves.toEqual({
      error: 'AI service temporarily unavailable. Please try again.',
    });
  });
});
