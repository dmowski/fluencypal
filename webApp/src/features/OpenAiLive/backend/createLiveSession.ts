import { createHash } from 'crypto';
import {
  buildOpenAiLiveDelegationInstructions,
  OPEN_AI_LIVE_DELEGATION_MODEL,
} from '../instructions';

type CreatedLiveSession = {
  sessionId: string;
  sdp: string;
};

export const createOpenAiLiveSession = async ({
  userId,
  sdp,
  instructions,
  voice,
}: {
  userId: string;
  sdp: string;
  instructions: string;
  voice: string;
}): Promise<CreatedLiveSession> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is not set');

  const response = await fetch('https://api.openai.com/v1/live/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Safety-Identifier': createHash('sha256').update(userId).digest('hex'),
    },
    body: JSON.stringify({
      session: {
        model: 'gpt-live-1',
        instructions,
        audio: { output: { voice } },
        delegation: {
          type: 'responses',
          responses: {
            model: OPEN_AI_LIVE_DELEGATION_MODEL,
            instructions: buildOpenAiLiveDelegationInstructions(),
          },
        },
      },
      transport: { type: 'webrtc', sdp },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('GPT-Live session creation failed', response.status, detail.slice(0, 500));
    throw new Error('Could not start the live session');
  }

  const payload = (await response.json()) as {
    session?: { id?: string };
    transport?: { sdp?: string };
  };
  const sessionId = payload.session?.id;
  const answerSdp = payload.transport?.sdp;
  if (!sessionId || !answerSdp) {
    throw new Error('Could not start the live session');
  }

  return { sessionId, sdp: answerSdp };
};
