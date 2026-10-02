import { ensureOpenAiLiveWelcomeBalance } from '@/features/OpenAiLive/backend/billing';
import {
  openAiLiveErrorResponse,
  requireOpenAiLiveUser,
} from '@/features/OpenAiLive/backend/requireUser';

export async function POST(request: Request) {
  try {
    const user = await requireOpenAiLiveUser(request);
    const result = await ensureOpenAiLiveWelcomeBalance(user.uid);
    return Response.json(result);
  } catch (error) {
    return openAiLiveErrorResponse(error);
  }
}
