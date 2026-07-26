import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { validateGameWinners } from '@/features/Chat/VoiceChat/backend/entitlements';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { VoiceChatValidateGameWinnerResponse } from '@/features/Chat/VoiceChat/types';

export async function POST(request: Request) {
  try {
    await validateAuthToken(request);
    const result = await validateGameWinners();
    return NextResponse.json<VoiceChatValidateGameWinnerResponse>(result);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}

export async function GET() {
  try {
    const result = await validateGameWinners();
    return NextResponse.json<VoiceChatValidateGameWinnerResponse>(result);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
