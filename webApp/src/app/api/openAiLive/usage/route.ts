import { settleOpenAiLiveSession } from '@/features/OpenAiLive/backend/billing';
import {
  openAiLiveErrorResponse,
  requireOpenAiLiveUser,
} from '@/features/OpenAiLive/backend/requireUser';

export async function POST(request: Request) {
  try {
    const user = await requireOpenAiLiveUser(request);
    const body = (await request.json()) as { sessionId?: unknown };
    if (typeof body.sessionId !== 'string' || !body.sessionId) {
      throw new Error('Session is required');
    }
    const result = await settleOpenAiLiveSession(user.uid, body.sessionId, false);
    return Response.json(result);
  } catch (error) {
    return openAiLiveErrorResponse(error);
  }
}
