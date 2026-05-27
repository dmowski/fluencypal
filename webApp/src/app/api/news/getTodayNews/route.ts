import { parseAuthenticatedJson, withRoute } from '../newsRouteHelpers';
import { GetTodayNewsRequest } from '../types';
import { getTodayNewsResponse } from './getTodayNewsResponse';

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
