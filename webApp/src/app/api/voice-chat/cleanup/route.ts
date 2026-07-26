import { NextResponse } from 'next/server';
import { cleanupExpiredMessages } from '@/features/Chat/VoiceChat/backend/messages';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { VOICE_CHAT_MESSAGE_TTL_DAYS } from '@/features/Chat/VoiceChat/types';

export async function GET(request: Request) {
  try {
    const result = await cleanupExpiredMessages(VOICE_CHAT_MESSAGE_TTL_DAYS);
    return NextResponse.json(result);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
