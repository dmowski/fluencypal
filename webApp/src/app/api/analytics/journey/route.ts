import { DEV_EMAILS } from '@/features/DevTools/dev';
import { validateAuthToken } from '../../config/firebase';
import {
  getJourneySummary,
  getVisitorJourney,
} from '@/features/Analytics/Custom/backend/getJourneyStats';
import { JourneyRequest, JourneyResponse } from '@/features/Analytics/Custom/types';
import { isValidVisitorId } from '@/features/Analytics/Custom/visitorId';

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error('User is not authenticated');
  }
  const isAdmin = DEV_EMAILS.includes(userInfo.email);
  if (!isAdmin) {
    throw new Error('User is not authorized');
  }

  const body = (await request.json()) as JourneyRequest;
  let response: JourneyResponse;

  if (body.type === 'visitor') {
    if (!isValidVisitorId(body.visitorId)) {
      throw new Error('Invalid visitor id');
    }
    response = await getVisitorJourney(body.visitorId);
  } else if (body.type === 'summary') {
    if (!body.fromIso || !body.toIso || !body.dayKey) {
      throw new Error('Missing date range');
    }
    response = await getJourneySummary({
      dayKey: body.dayKey,
      fromIso: body.fromIso,
      toIso: body.toIso,
    });
  } else {
    throw new Error('Unknown request type');
  }

  return Response.json(response);
}
