import OpenAI from 'openai';
import {
  OPENAI_EXAM_IMAGE_MODEL,
  OPENAI_EXAM_IMAGE_QUALITY,
  OPENAI_EXAM_IMAGE_SIZE,
} from '@/features/Quiz/exam/openAiExamImageConfig';

export const generateImageBuffer = async (description: string): Promise<Buffer<ArrayBuffer>> => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    throw new Error('OpenAI API key is not set');
  }

  const client = new OpenAI({
    apiKey: openAIKey,
  });

  const result = await client.images.generate({
    model: OPENAI_EXAM_IMAGE_MODEL,
    prompt: description,
    size: OPENAI_EXAM_IMAGE_SIZE,
    quality: OPENAI_EXAM_IMAGE_QUALITY,
  });

  // Save the image to a file
  const image_base64 = result?.data?.[0].b64_json;
  if (!image_base64) {
    throw new Error('Image generation failed, no base64 data returned');
  }
  const image_bytes = Buffer.from(image_base64, 'base64');
  return image_bytes;
};
