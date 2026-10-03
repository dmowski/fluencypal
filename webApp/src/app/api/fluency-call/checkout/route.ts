import { createFluencyCallCheckout } from '@/features/FluencyCall/backend/checkout';
import {
  fluencyCallErrorResponse,
  requireFluencyCallBuyer,
} from '@/features/FluencyCall/backend/requireUser';

export async function POST(request: Request) {
  try {
    const user = await requireFluencyCallBuyer(request);
    const siteUrl = request.headers.get('origin');
    if (!siteUrl) throw new Error('Origin header is not set');

    const body = (await request.json()) as {
      currency?: unknown;
      languageCode?: unknown;
    };
    const sessionUrl = await createFluencyCallCheckout({
      userId: user.uid,
      currency: typeof body.currency === 'string' ? body.currency : 'usd',
      languageCode: typeof body.languageCode === 'string' ? body.languageCode : 'en',
      siteUrl,
    });
    return Response.json({ sessionUrl, error: null });
  } catch (error) {
    return fluencyCallErrorResponse(error);
  }
}
