import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { markMessageListened } from '@/features/Chat/VoiceChat/backend/messages';
import {
  parseMarkListenedRequest,
  voiceChatErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { VoiceChatMarkListenedResponse } from '@/features/Chat/VoiceChat/types';

export async function POST(request: Request) {
  try {
    const user = await validateAuthToken(request);
    const body = await parseMarkListenedRequest(request);
    await markMessageListened(user.uid, body.messageId);
    return NextResponse.json<VoiceChatMarkListenedResponse>({ ok: true });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
