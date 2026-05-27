import { NewsLanguageComplexity } from '@/features/News/types';
import { validateAuthToken } from '../../config/firebase';
import { getCachedNewsById, mergeNewsVersion } from '../cache';
import { rewriteNewsForLevel } from '../rewriteNewsForLevels';
import { GetNewsFullTextRequest, GetNewsFullTextResponse } from '../types';

const isComplexity = (value: unknown): value is NewsLanguageComplexity =>
  value === 'beginner' || value === 'middle' || value === 'advance';

export const maxDuration = 30;

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

  const body = (await request.json()) as Partial<GetNewsFullTextRequest>;
  if (typeof body.id !== 'string' || body.id.length === 0 || !isComplexity(body.complexity)) {
    return new Response('Invalid request body', { status: 400 });
  }

  const item = await getCachedNewsById(body.id);
  if (!item) {
    const response: GetNewsFullTextResponse = { text: null };
    return Response.json(response);
  }

  const cachedText = item.versions?.[body.complexity];
  if (cachedText) {
    const response: GetNewsFullTextResponse = { text: cachedText };
    return Response.json(response);
  }

  try {
    const text = await rewriteNewsForLevel({
      title: item.titleOrigin || item.title,
      content_origin: item.content_origin,
      targetLanguageName: item.languageName,
      complexity: body.complexity,
    });
    await mergeNewsVersion(body.id, body.complexity, text);
    const response: GetNewsFullTextResponse = { text };
    return Response.json(response);
  } catch {
    return new Response('Failed to generate news text', { status: 500 });
  }
}
