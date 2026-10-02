import { isIdentifiedAuthUser } from '@/features/Auth/identifiedAuth';
import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { validateAuthToken } from '@/app/api/config/firebase';
import { getUserBalance } from '@/app/api/payment/getUserBalance';

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

export const requireOpenAiLiveUser = async (request: Request) => {
  const user = await validateAuthToken(request);
  if (!user.uid || !isIdentifiedAuthUser(user)) {
    throw new OpenAiLiveForbiddenError();
  }
  const balance = await getUserBalance(user.uid);
  if (!balance.isFullAccess) {
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
  console.error('OpenAI Live request failed', message);
  return Response.json({ error: message }, { status: 400 });
};
