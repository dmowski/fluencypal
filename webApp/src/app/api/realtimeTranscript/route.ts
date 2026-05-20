import { validateAuthToken } from '../config/firebase';
import { getEphemeralToken } from '../token/getEphemeralToken';
import { rateLimitRealtimeInit } from '../usage/rateLimitRealtimeInit';

const TRANSCRIPT_REALTIME_MODEL = 'gpt-realtime-mini';

export async function POST(request: Request) {
  try {
    const userInfo = await validateAuthToken(request);

    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      return new Response('Unsupported content type', { status: 415 });
    }

    const body = (await request.json()) as { sdp?: unknown };

    if (typeof body.sdp !== 'string' || body.sdp.length < 10 || body.sdp.length > 200_000) {
      return new Response('Invalid SDP', { status: 400 });
    }

    const rl = await rateLimitRealtimeInit({
      userId: userInfo.uid,
      limit: 10,
      windowMs: 60_000,
      cooldownMs: 1500,
    });

    if (!rl.ok) {
      const retryAfterSec = Math.ceil((rl.retryAfterMs ?? 1000) / 1000);
      return new Response('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      });
    }

    const ephemeralKey = await getEphemeralToken(TRANSCRIPT_REALTIME_MODEL, userInfo.uid);

    const url = new URL('https://api.openai.com/v1/realtime/calls');
    url.searchParams.set('model', TRANSCRIPT_REALTIME_MODEL);

    const sdpResponse = await fetch(url.toString(), {
      method: 'POST',
      body: body.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    if (!sdpResponse.ok) {
      const errText = await sdpResponse.text().catch(() => '');
      console.error('Transcript SDP failed', {
        uid: userInfo.uid,
        status: sdpResponse.status,
        body: errText.slice(0, 500),
      });
      return new Response('Realtime negotiation failed', { status: 502 });
    }

    return Response.json({ sdpResponse: await sdpResponse.text() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes('authorization') || msg.toLowerCase().includes('token')) {
      return new Response('Unauthorized', { status: 401 });
    }
    console.error('POST /api/realtimeTranscript unexpected error', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
