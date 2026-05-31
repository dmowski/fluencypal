import { getPublishedBlog } from '@/features/Blog/backend/blogService';
import { parseBlogLang } from '@/features/Blog/backend/blogMappers';
import { GetBlogRequest } from '@/features/Blog/types';

const badLangResponse = () =>
  new Response('lang is required and must be a supported language code', { status: 400 });

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<GetBlogRequest>;
  if (!body.blogId || typeof body.blogId !== 'string') {
    return new Response('blogId is required', { status: 400 });
  }
  const lang = parseBlogLang(body.lang ?? null);
  if (!lang) return badLangResponse();

  const response = await getPublishedBlog(body.blogId, lang);
  return Response.json(response);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blogId');
  if (!blogId) {
    return new Response('blogId is required', { status: 400 });
  }
  const lang = parseBlogLang(searchParams.get('lang'));
  if (!lang) return badLangResponse();

  const response = await getPublishedBlog(blogId, lang);
  return Response.json(response);
}
