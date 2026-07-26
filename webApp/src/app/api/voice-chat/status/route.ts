import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { getVoiceChatStatus } from '@/features/Chat/VoiceChat/backend/status';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { VoiceChatStatusResponse } from '@/features/Chat/VoiceChat/types';

export async function GET(request: Request) {
  try {
    const user = await validateAuthToken(request);
    const status = await getVoiceChatStatus(user.uid);
    return NextResponse.json<VoiceChatStatusResponse>(status);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
