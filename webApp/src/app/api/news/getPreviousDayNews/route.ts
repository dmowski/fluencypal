import { NewsItem, NewsItemSummary } from '@/features/News/types';
import { validateAuthToken } from '../../config/firebase';
import { getCachedPreviousDayNews } from '../cache';
import { GetPreviousDayNewsRequest, GetPreviousDayNewsResponse } from '../types';

const toSummary = (item: NewsItem): NewsItemSummary => ({
  id: item.id,
  title: item.title,
  subTitle: item.subTitle,
  imageUrl: item.imageUrl,
  dateIso: item.dateIso,
  countryCode: item.countryCode,
  languageCode: item.languageCode,
  category: item.category ?? 'general',
  tags: item.tags ?? [],
});

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

  const body = (await request.json()) as Partial<GetPreviousDayNewsRequest>;
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

  const response: GetPreviousDayNewsResponse = { items: items.map(toSummary) };
  return Response.json(response);
}
