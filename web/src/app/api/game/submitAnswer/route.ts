import { SubmitAnswerRequest } from '@/features/Game/types';
import { validateAuthToken } from '../../config/firebase';
import { submitAnswer } from '@/features/Game/api/submitAnswer';

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const data = (await request.json()) as SubmitAnswerRequest;
  const response = await submitAnswer({ data, userInfo });
  return Response.json(response);
}
