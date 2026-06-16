import { describeImage } from '@/features/Quiz/backend/describeImage';
import {
  ExamGenerateImageRequest,
  ExamGenerateImageResponse,
} from '@/features/Quiz/backend/examGenerateImageTypes';
import { generateImageBuffer } from '@/app/api/images/generateImage';
import { uploadImage } from '@/app/api/images/uploadImage';
import { validateAuthToken } from '@/app/api/config/firebase';

export const maxDuration = 60;

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await request.json()) as ExamGenerateImageRequest;
  if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
    return new Response('Invalid prompt', { status: 400 });
  }
  if (body.purpose !== 'writing-prompt' && body.purpose !== 'speaking-photo') {
    return new Response('Invalid purpose', { status: 400 });
  }

  try {
    const imageBuffer = await generateImageBuffer(body.prompt.trim());
    const slug = body.examId?.replace(/[^a-zA-Z0-9-_]/g, '-') || 'exam';
    const fileName = `${slug}-${body.purpose}-${Date.now()}.png`;
    const imageUrl = await uploadImage({
      imageBuffer,
      extension: 'png',
      name: fileName,
    });
    const imageDescription = await describeImage(imageUrl);
    const response: ExamGenerateImageResponse = { imageUrl, imageDescription };
    return Response.json(response);
  } catch (error) {
    console.error('exam generateImage failed', error);
    return new Response('Failed to generate exam image', { status: 500 });
  }
}
