import { GetGameQuestionsRequest } from '@/features/Game/types';
import { validateAuthToken } from '../../config/firebase';
import { generateUsersQuestions } from '@/features/Game/api/generateUsersQuestions';

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const requestData = (await request.json()) as GetGameQuestionsRequest;
  const responseData = await generateUsersQuestions({
    userInfo,
    requestData,
  });
  return Response.json(responseData);
}
