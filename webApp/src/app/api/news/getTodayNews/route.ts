import { parseAuthenticatedJson, withRoute } from '@/features/News/backend/newsRouteHelpers';
import { GetTodayNewsRequest } from '@/features/News/backend/types';
import { getTodayNewsResponse } from '@/features/News/backend/getTodayNews/getTodayNewsResponse';

export const maxDuration = 60;

export const POST = withRoute(async (request) => {
  const body = await parseAuthenticatedJson<GetTodayNewsRequest>(request);
  if (
    typeof body.countryCode !== 'string' ||
    typeof body.countryName !== 'string' ||
    typeof body.languageCode !== 'string' ||
    typeof body.languageName !== 'string'
  ) {
    return new Response('Invalid request body', { status: 400 });
  }

  const response = await getTodayNewsResponse({
    countryCode: body.countryCode,
    countryName: body.countryName,
    languageCode: body.languageCode,
    languageName: body.languageName,
  });

  return Response.json(response);
});
