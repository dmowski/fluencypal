import { GetTodayNewsRequest } from '../types';
import { getTodayNewsResponse } from './getTodayNewsResponse';

// Allow up to 60 s for GNews fetch + parallel image copy / translation / AI
// rewrite across 3 articles before Vercel terminates the function.
export const maxDuration = 60;

export async function POST(request: Request) {
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
