import { describeImage } from '@/features/Quiz/backend/describeImage';
import { DescribeImageRequest, DescribeImageResponse } from '@/features/Quiz/backend/types';
import { validateAuthToken } from '../../config/firebase';

export const maxDuration = 30;

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await request.json()) as DescribeImageRequest;
  if (typeof body.imageUrl !== 'string' || body.imageUrl.length === 0) {
    return new Response('Invalid request body', { status: 400 });
  }

  try {
    const description = await describeImage(body.imageUrl);
    const response: DescribeImageResponse = { description };
    return Response.json(response);
  } catch (error) {
    console.error('describeImage failed', error);
    return new Response('Failed to analyze image', { status: 500 });
  }
}
