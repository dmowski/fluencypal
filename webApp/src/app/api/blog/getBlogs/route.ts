import { getPublishedBlogs } from '@/features/Blog/backend/blogService';
import { parseBlogLang } from '@/features/Blog/backend/blogMappers';

const badLangResponse = () =>
  new Response('lang query parameter is required and must be a supported language code', {
    status: 400,
  });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = parseBlogLang(searchParams.get('lang'));
  if (!lang) return badLangResponse();

  const response = await getPublishedBlogs(lang);
  return Response.json(response);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { lang?: string };
  const lang = parseBlogLang(body.lang ?? null);
  if (!lang) return badLangResponse();

  const response = await getPublishedBlogs(lang);
  return Response.json(response);
}
