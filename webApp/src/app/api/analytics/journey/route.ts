import { DEV_EMAILS } from '@/features/DevTools/dev';
import { validateAuthToken } from '../../config/firebase';
import {
  getJourneySummary,
  getVisitorJourney,
} from '@/features/Analytics/Custom/backend/getJourneyStats';
import { JourneyRequest, JourneyResponse } from '@/features/Analytics/Custom/types';
import { isValidVisitorId } from '@/features/Analytics/Custom/visitorId';

const isIndexError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('FAILED_PRECONDITION') || message.includes('requires an index');
};

export async function POST(request: Request) {
  try {
    const userInfo = await validateAuthToken(request);
    if (!userInfo.uid) {
      return Response.json({ error: 'User is not authenticated' }, { status: 401 });
    }
    const isAdmin = DEV_EMAILS.includes(userInfo.email);
    if (!isAdmin) {
      return Response.json({ error: 'User is not authorized' }, { status: 403 });
    }

    const body = (await request.json()) as JourneyRequest;
    let response: JourneyResponse;

    if (body.type === 'visitor') {
      if (!isValidVisitorId(body.visitorId)) {
        return Response.json({ error: 'Invalid visitor id' }, { status: 400 });
      }
      response = await getVisitorJourney(body.visitorId);
    } else if (body.type === 'summary') {
      if (!body.fromIso || !body.toIso || !body.dayKey) {
        return Response.json({ error: 'Missing date range' }, { status: 400 });
      }
      response = await getJourneySummary({
        dayKey: body.dayKey,
        fromIso: body.fromIso,
        toIso: body.toIso,
      });
    } else {
      return Response.json({ error: 'Unknown request type' }, { status: 400 });
    }

    return Response.json(response);
  } catch (error) {
    console.error('analytics journey error', error);
    if (isIndexError(error)) {
      return Response.json(
        {
          error: 'Firestore index is still building. Run pnpm firestore:indexes and retry shortly.',
        },
        { status: 503 },
      );
    }
    return Response.json({ error: 'Failed to load journey' }, { status: 500 });
  }
}
