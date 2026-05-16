import { validateAuthToken } from '../../config/firebase';
import { getCachedNewsById } from '../cache';
import { GetNewsByIdRequest, GetNewsByIdResponse } from '../types';

export async function POST(request: Request) {
  try {
    await validateAuthToken(request);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    return new Response('Unsupported content type', { status: 415 });
  }

  const body = (await request.json()) as Partial<GetNewsByIdRequest>;
  if (typeof body.id !== 'string' || body.id.length === 0) {
    return new Response('Invalid request body', { status: 400 });
  }

  const item = await getCachedNewsById(body.id);
  const response: GetNewsByIdResponse = { item };
  return Response.json(response);
}
