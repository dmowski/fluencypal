import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { getDB, validateAuthToken } from '@/app/api/config/firebase';
import { sentSupportTelegramMessage } from '@/app/api/telegram/sendTelegramMessage';
import { hasFluencyCallAccess } from '@/features/FluencyCall/backend/access';
import { fluencyCallLanguageCode } from '@/features/FluencyCall/callLanguage';
import {
  buildCallRequestTelegramMessage,
  isUpcomingCallInstant,
} from '@/features/FluencyCall/callTime';
import { FluencyCallRequest } from '@/features/FluencyCall/types';
import { supportedLanguagesToLearn } from '@/features/Lang/lang';

export async function POST(request: Request) {
  let userInfo: Awaited<ReturnType<typeof validateAuthToken>>;
  try {
    userInfo = await validateAuthToken(request);
  } catch (error) {
    const unauthorized = jsonIfAuthTokenError(error);
    if (unauthorized) return unauthorized;
    throw error;
  }

  const body = (await request.json()) as { startsAtIso?: unknown; languageCode?: unknown };
  const startsAtIso = typeof body.startsAtIso === 'string' ? body.startsAtIso : '';
  const startMs = new Date(startsAtIso).getTime();
  const isUtcIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(startsAtIso);
  if (!isUtcIso || Number.isNaN(startMs) || !isUpcomingCallInstant(startsAtIso, new Date())) {
    return Response.json({ error: 'Pick a future date and time.' }, { status: 400 });
  }

  const requestedLanguage = typeof body.languageCode === 'string' ? body.languageCode : 'en';
  if (!supportedLanguagesToLearn.some((code) => code === requestedLanguage)) {
    return Response.json({ error: 'Pick a language.' }, { status: 400 });
  }
  const languageCode = fluencyCallLanguageCode(requestedLanguage);

  const canRequest = await hasFluencyCallAccess(userInfo.uid);
  if (!canRequest) {
    return Response.json(
      { error: 'Group conversations are not included in this account.' },
      { status: 403 },
    );
  }

  const message = buildCallRequestTelegramMessage(startsAtIso, languageCode);
  await sentSupportTelegramMessage({ message, userId: userInfo.uid });

  const record: FluencyCallRequest = {
    id: userInfo.uid,
    userId: userInfo.uid,
    email: userInfo.email || '',
    startsAtIso,
    languageCode,
    createdAtIso: new Date().toISOString(),
    status: 'pending',
  };
  await getDB().collection('fluencyCallRequests').doc(userInfo.uid).set(record);

  return Response.json({ error: '' });
}
