import { getPublishedBlog } from '@/features/Blog/backend/blogService';
import { GetBlogRequest } from '@/features/Blog/types';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<GetBlogRequest>;
  if (!body.blogId || typeof body.blogId !== 'string') {
    return new Response('blogId is required', { status: 400 });
  }
  const response = await getPublishedBlog(body.blogId);
  return Response.json(response);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blogId');
  if (!blogId) {
    return new Response('blogId is required', { status: 400 });
  }
  const response = await getPublishedBlog(blogId);
  return Response.json(response);
}
