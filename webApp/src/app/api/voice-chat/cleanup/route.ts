import { NextResponse } from 'next/server';
import { cleanupExpiredMessages } from '@/features/Chat/VoiceChat/backend/messages';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import {
  VOICE_CHAT_MESSAGE_TTL_DAYS,
  VoiceChatCleanupResponse,
} from '@/features/Chat/VoiceChat/types';

export async function GET() {
  try {
    const result = await cleanupExpiredMessages(VOICE_CHAT_MESSAGE_TTL_DAYS);
    return NextResponse.json<VoiceChatCleanupResponse>(result);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
