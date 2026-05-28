import { getCachedPreviousDayNews } from '@/features/News/backend/cache';
import {
  parseAuthenticatedJson,
  toNewsItemSummary,
  withRoute,
} from '@/features/News/backend/newsRouteHelpers';
import {
  GetPreviousDayNewsRequest,
  GetPreviousDayNewsResponse,
} from '@/features/News/backend/types';

export const POST = withRoute(async (request) => {
  const body = await parseAuthenticatedJson<GetPreviousDayNewsRequest>(request);
  if (typeof body.countryCode !== 'string' || typeof body.languageCode !== 'string') {
    return new Response('Invalid request body', { status: 400 });
  }

  const daysBack =
    typeof body.daysBack === 'number' && Number.isInteger(body.daysBack) && body.daysBack >= 1
      ? body.daysBack
      : 1;

  const items = await getCachedPreviousDayNews({
    countryCode: body.countryCode,
    languageCode: body.languageCode,
    daysBack,
  });

  const response: GetPreviousDayNewsResponse = { items: items.map(toNewsItemSummary) };
  return Response.json(response);
});
