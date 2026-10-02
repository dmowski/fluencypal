import { isOpenAiLiveMode } from '@/features/OpenAiLive/types';
import { isOpenAiLiveVoice } from '@/features/OpenAiLive/voices';
import { openAiLiveMinimumStartUsdMicros } from '@/features/OpenAiLive/pricing';
import {
  beginOpenAiLiveBilling,
  closeActiveOpenAiLiveSession,
  ensureOpenAiLiveWelcomeBalance,
  readOpenAiLiveBalance,
} from '@/features/OpenAiLive/backend/billing';
import { createOpenAiLiveSession } from '@/features/OpenAiLive/backend/createLiveSession';
import { loadOpenAiLivePrompt } from '@/features/OpenAiLive/backend/loadPromptContext';
import {
  OpenAiLiveNoBalanceError,
  openAiLiveErrorResponse,
  requireOpenAiLiveUser,
} from '@/features/OpenAiLive/backend/requireUser';

export async function POST(request: Request) {
  try {
    const user = await requireOpenAiLiveUser(request);
    const body = (await request.json()) as { sdp?: unknown; mode?: unknown; voice?: unknown };
    if (typeof body.sdp !== 'string' || body.sdp.trim().length < 10 || body.sdp.length > 200_000) {
      throw new Error('An SDP offer is required');
    }
    if (!isOpenAiLiveMode(body.mode)) {
      throw new Error('Choose how you want to talk');
    }
    const voice = typeof body.voice === 'string' ? body.voice : '';
    if (!isOpenAiLiveVoice(voice)) {
      throw new Error('Choose a voice');
    }

    await ensureOpenAiLiveWelcomeBalance(user.uid);
    await closeActiveOpenAiLiveSession(user.uid);
    const balance = await readOpenAiLiveBalance(user.uid);
    if (balance < openAiLiveMinimumStartUsdMicros) {
      throw new OpenAiLiveNoBalanceError();
    }

    const prompt = await loadOpenAiLivePrompt(user.uid, body.mode, voice);
    const created = await createOpenAiLiveSession({
      userId: user.uid,
      sdp: body.sdp,
      instructions: prompt.instructions,
      voice: prompt.voice,
    });
    await beginOpenAiLiveBilling({
      userId: user.uid,
      sessionId: created.sessionId,
      mode: body.mode,
    });
    return Response.json(created);
  } catch (error) {
    return openAiLiveErrorResponse(error);
  }
}
