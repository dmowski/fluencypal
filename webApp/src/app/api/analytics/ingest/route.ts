import { NextRequest } from 'next/server';
import {
  isAllowedAnalyticsOrigin,
  isAllowedIngestHost,
} from '@/features/Analytics/Custom/allowedOrigins';
import {
  clientIpFromHeaders,
  ingestAnalyticsEvent,
  isRateLimited,
} from '@/features/Analytics/Custom/backend/ingestEvent';
import { IngestEventRequest, IngestEventResponse } from '@/features/Analytics/Custom/types';
import { validateClientEvent, validateVisitorId } from '@/features/Analytics/Custom/validateEvent';

const json = (body: IngestEventResponse, status: number) => Response.json(body, { status });

const isAllowedIngestRequest = (request: NextRequest): boolean => {
  const analyticsHeader = request.headers.get('x-fp-analytics');
  if (analyticsHeader !== 'tracker') return false;

  const origin = request.headers.get('origin');
  if (origin) return isAllowedAnalyticsOrigin(origin);

  const host = request.headers.get('host') || '';
  return isAllowedIngestHost(host);
};

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedIngestRequest(request)) {
      return json({ ok: false, error: 'Forbidden' }, 403);
    }

    const payload = (await request.json()) as IngestEventRequest;
    const visitorId = validateVisitorId(payload?.visitorId);
    const event = validateClientEvent(payload?.event);
    if (!visitorId || !event) {
      return json({ ok: false, error: 'Invalid event' }, 400);
    }

    const ip = clientIpFromHeaders(request);
    if (isRateLimited(visitorId, ip)) {
      return json({ ok: false, error: 'Rate limited' }, 429);
    }

    await ingestAnalyticsEvent({
      visitorId,
      event,
      userAgent: (request.headers.get('user-agent') || '').slice(0, 500),
    });

    return json({ ok: true }, 200);
  } catch (error) {
    console.error('analytics ingest error', error);
    return json({ ok: false, error: 'Ingest failed' }, 500);
  }
}
