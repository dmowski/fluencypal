import { getPublishedBlogs } from '@/features/Blog/backend/blogService';

export async function GET() {
  const response = await getPublishedBlogs();
  return Response.json(response);
}

export async function POST() {
  const response = await getPublishedBlogs();
  return Response.json(response);
}
