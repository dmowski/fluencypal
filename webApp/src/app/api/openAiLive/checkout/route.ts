import { createOpenAiLiveCheckout } from '@/features/OpenAiLive/backend/checkout';
import {
  openAiLiveErrorResponse,
  requireOpenAiLiveUser,
} from '@/features/OpenAiLive/backend/requireUser';

export async function POST(request: Request) {
  try {
    const user = await requireOpenAiLiveUser(request);
    const siteUrl = request.headers.get('origin');
    if (!siteUrl) throw new Error('Origin header is not set');

    const body = (await request.json()) as {
      hours?: unknown;
      currency?: unknown;
      languageCode?: unknown;
    };
    const sessionUrl = await createOpenAiLiveCheckout({
      userId: user.uid,
      hours: typeof body.hours === 'number' ? body.hours : Number(body.hours),
      currency: typeof body.currency === 'string' ? body.currency : 'usd',
      languageCode: typeof body.languageCode === 'string' ? body.languageCode : 'en',
      siteUrl,
    });
    return Response.json({ sessionUrl, error: null });
  } catch (error) {
    return openAiLiveErrorResponse(error);
  }
}
