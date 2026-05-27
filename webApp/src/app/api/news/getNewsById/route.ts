import { getCachedNewsById } from '../cache';
import { parseAuthenticatedJson, withRoute } from '../newsRouteHelpers';
import { GetNewsByIdRequest, GetNewsByIdResponse } from '../types';

export const POST = withRoute(async (request) => {
  const body = await parseAuthenticatedJson<GetNewsByIdRequest>(request);
  if (typeof body.id !== 'string' || body.id.length === 0) {
    return new Response('Invalid request body', { status: 400 });
  }

  const item = await getCachedNewsById(body.id);
  const response: GetNewsByIdResponse = { item };
  return Response.json(response);
});
