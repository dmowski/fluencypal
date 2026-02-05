import { SendSdpOfferRequest, SendSdpOfferResponse } from '@/common/requests';
import { getEphemeralToken } from '../token/getEphemeralToken';
import { validateAuthToken } from '../config/firebase';
import { rateLimitRealtimeInit } from '../usage/rateLimitRealtimeInit';

const ALLOWED_MODELS = new Set(['gpt-realtime-mini', 'gpt-realtime']);

export async function POST(request: Request) {
  try {
    // Auth first (prevents unauthenticated spend)
    const userInfo = await validateAuthToken(request);

    // Basic content-type guard (optional but good)
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      return new Response('Unsupported content type', { status: 415 });
    }

    const body = (await request.json()) as SendSdpOfferRequest;

    // Validate model
    if (!body?.model || !ALLOWED_MODELS.has(body.model)) {
      return new Response('Invalid model', { status: 400 });
    }

    // Validate SDP
    if (typeof body.sdp !== 'string' || body.sdp.length < 10 || body.sdp.length > 200_000) {
      return new Response('Invalid SDP', { status: 400 });
    }

    // Rate limit: e.g. 10/min + cooldown 1500ms between calls
    const rl = await rateLimitRealtimeInit({
      userId: userInfo.uid,
      limit: 10,
      windowMs: 60_000,
      cooldownMs: 1500,
    });

    if (!rl.ok) {
      // Retry-After in seconds is standard
      const retryAfterSec = Math.ceil((rl.retryAfterMs ?? 1000) / 1000);
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
        },
      });
    }

    // Create ephemeral token (after auth + rate limit)
    const ephemeralKey = await getEphemeralToken(body.model);

    // Call OpenAI realtime SDP endpoint
    const url = new URL('https://api.openai.com/v1/realtime');
    url.searchParams.set('model', body.model);

    const sdpResponse = await fetch(url.toString(), {
      method: 'POST',
      body: body.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    if (!sdpResponse.ok) {
      // Log details server-side (avoid returning internals)
      const errText = await sdpResponse.text().catch(() => '');
      console.error('Realtime SDP failed', {
        uid: userInfo.uid,
        status: sdpResponse.status,
        body: errText.slice(0, 500),
      });

      return new Response('Realtime negotiation failed', { status: 502 });
    }

    const response: SendSdpOfferResponse = {
      sdpResponse: await sdpResponse.text(),
    };

    return Response.json(response);
  } catch (e) {
    // Auth errors should map to 401 (your validateAuthToken throws "Invalid token")
    const msg = e instanceof Error ? e.message : String(e);

    if (msg.toLowerCase().includes('authorization') || msg.toLowerCase().includes('token')) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.error('POST /realtime/sdp unexpected error', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
