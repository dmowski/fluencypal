import {
  OpenAiLiveCheckoutResponse,
  OpenAiLiveSessionResponse,
  OpenAiLiveUsageResponse,
  OpenAiLiveWelcomeResponse,
} from './types';

export class OpenAiLiveApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'OpenAiLiveApiError';
    this.status = status;
  }
}

const postOpenAiLive = async <T>(path: string, token: string, body?: unknown): Promise<T> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new OpenAiLiveApiError(payload.error || 'Request failed', response.status);
  }
  return payload as T;
};

export const requestOpenAiLiveWelcome = (token: string) =>
  postOpenAiLive<OpenAiLiveWelcomeResponse>('/api/openAiLive/welcome', token);

export const requestOpenAiLiveSession = (
  token: string,
  body: { sdp: string; mode: 'talk' | 'grammar'; voice: string },
) => postOpenAiLive<OpenAiLiveSessionResponse>('/api/openAiLive/session', token, body);

export const requestOpenAiLiveUsage = (token: string, sessionId: string) =>
  postOpenAiLive<OpenAiLiveUsageResponse>('/api/openAiLive/usage', token, { sessionId });

export const requestOpenAiLiveClose = (token: string, sessionId: string) =>
  postOpenAiLive<OpenAiLiveUsageResponse>('/api/openAiLive/close', token, { sessionId });

export const requestOpenAiLiveCheckout = (
  token: string,
  body: { hours: number; currency: string; languageCode: string },
) => postOpenAiLive<OpenAiLiveCheckoutResponse>('/api/openAiLive/checkout', token, body);
