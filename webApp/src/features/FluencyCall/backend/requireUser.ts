import { isIdentifiedAuthUser } from '@/features/Auth/identifiedAuth';
import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { getDB, validateAuthToken } from '@/app/api/config/firebase';
import { UserSettings } from '@/features/Settings/userSettings';

export class FluencyCallForbiddenError extends Error {
  constructor() {
    super('Not available');
    this.name = 'FluencyCallForbiddenError';
  }
}

export const requireFluencyCallBuyer = async (request: Request) => {
  const user = await validateAuthToken(request);
  if (!user.uid || !isIdentifiedAuthUser(user)) {
    throw new FluencyCallForbiddenError();
  }
  const snap = await getDB().collection('users').doc(user.uid).get();
  const settings = snap.data() as UserSettings | undefined;
  if (settings?.isParentalConsentNeeded) {
    throw new FluencyCallForbiddenError();
  }
  return user;
};

export const fluencyCallErrorResponse = (error: unknown): Response => {
  const authResponse = jsonIfAuthTokenError(error);
  if (authResponse) return authResponse;
  if (error instanceof FluencyCallForbiddenError) {
    return Response.json({ error: 'Not available' }, { status: 403 });
  }
  const message = error instanceof Error ? error.message : 'Request failed';
  console.error('Fluency call request failed', message);
  return Response.json({ error: message }, { status: 400 });
};
