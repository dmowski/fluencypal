import { isIdentifiedAuthUser } from '@/features/Auth/identifiedAuth';
import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { validateAuthToken } from '@/app/api/config/firebase';

export class OpenAiLiveForbiddenError extends Error {
  constructor() {
    super('Not available');
    this.name = 'OpenAiLiveForbiddenError';
  }
}

export class OpenAiLiveNoBalanceError extends Error {
  constructor() {
    super('no_balance');
    this.name = 'OpenAiLiveNoBalanceError';
  }
}

const failureCode = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  const code = (error as { code?: unknown }).code;
  if (typeof code !== 'string') return null;
  const safe = code
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32);
  return safe || null;
};

export const requireOpenAiLiveUser = async (request: Request) => {
  const user = await validateAuthToken(request);
  if (!user.uid || !isIdentifiedAuthUser(user)) {
    throw new OpenAiLiveForbiddenError();
  }
  return user;
};

export const openAiLiveErrorResponse = (error: unknown): Response => {
  const authResponse = jsonIfAuthTokenError(error);
  if (authResponse) return authResponse;
  if (error instanceof OpenAiLiveForbiddenError) {
    return Response.json({ error: 'Not available' }, { status: 403 });
  }
  if (error instanceof OpenAiLiveNoBalanceError) {
    return Response.json({ error: 'no_balance' }, { status: 402 });
  }
  const message = error instanceof Error ? error.message : 'Request failed';
  const code = failureCode(error);
  console.error('OpenAI Live request failed', code || message);
  return Response.json(code ? { error: message, code } : { error: message }, { status: 400 });
};
