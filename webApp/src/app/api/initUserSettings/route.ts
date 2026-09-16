import { validateAuthToken, getDB } from '../config/firebase';
import { InitUserSettings } from '@/features/Settings/userSettings';
import { getIdentifiedProfileUpdates } from '@/features/Settings/identifiedProfileUpdates';
import { InitUserSettingsRequest, InitUserSettingsResponse } from './types';

export async function POST(request: Request): Promise<Response> {
  const userInfo = await validateAuthToken(request);
  const userId = userInfo.uid;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = getDB();
  const userDoc = db.collection('users').doc(userId);
  const snapshot = await userDoc.get();
  const data = snapshot.data();
  const body = (await request.json()) as InitUserSettingsRequest;

  const isNoCreatedAt = !data?.createdAt;
  const isNew = !snapshot.exists || isNoCreatedAt;

  if (!isNew) {
    const profileUpdates = getIdentifiedProfileUpdates({
      existing: data,
      authEmail: userInfo.email || null,
      photoUrl: body.photoUrl,
      displayName: body.displayName,
    });
    if (Object.keys(profileUpdates).length > 0) {
      await userDoc.set(profileUpdates, { merge: true });
    }

    const response: InitUserSettingsResponse = { status: 'already_initialized' };
    return new Response(JSON.stringify(response), { status: 200 });
  }

  const settingsData: InitUserSettings = {
    createdAt: Date.now(),
    createdAtIso: new Date().toISOString(),
    currency: body.currency,
    email: userInfo.email || null,
    country: body.country,
    countryName: body.countryName,
    userSource: body.userSource,
  };

  await userDoc.set(
    { ...settingsData, photoUrl: body.photoUrl, displayName: body.displayName },
    { merge: true },
  );

  const response: InitUserSettingsResponse = { status: 'initialized' };
  return new Response(JSON.stringify(response), { status: 200 });
}
