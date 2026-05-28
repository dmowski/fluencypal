import { NewsLanguageComplexity } from '@/features/News/types';
import { getCachedNewsById, mergeNewsVersion } from '@/features/News/backend/cache';
import { parseAuthenticatedJson, withRoute } from '@/features/News/backend/newsRouteHelpers';
import { rewriteNewsForLevel } from '@/features/News/backend/rewriteNewsForLevels';
import { GetNewsFullTextRequest, GetNewsFullTextResponse } from '@/features/News/backend/types';

const isComplexity = (value: unknown): value is NewsLanguageComplexity =>
  value === 'beginner' || value === 'middle' || value === 'advance';

export const maxDuration = 30;

export const POST = withRoute(async (request) => {
  const body = await parseAuthenticatedJson<GetNewsFullTextRequest>(request);
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

  const text = await rewriteNewsForLevel({
    title: item.titleOrigin || item.title,
    content_origin: item.content_origin,
    targetLanguageName: item.languageName,
    complexity: body.complexity,
  });
  await mergeNewsVersion(body.id, body.complexity, text);
  const response: GetNewsFullTextResponse = { text };
  return Response.json(response);
});
