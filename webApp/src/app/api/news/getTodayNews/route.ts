import { validateAuthToken } from '../../config/firebase';
import { GetTodayNewsRequest } from '../types';
import { getTodayNewsResponse } from './getTodayNewsResponse';

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

  const body = (await request.json()) as Partial<GetTodayNewsRequest>;
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
}
