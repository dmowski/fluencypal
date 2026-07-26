import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { decideMembership } from '@/features/Chat/VoiceChat/backend/membership';
import {
  parseDecideRequest,
  voiceChatErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { VoiceChatDecideResponse } from '@/features/Chat/VoiceChat/types';

export async function POST(request: Request) {
  try {
    const user = await validateAuthToken(request);
    const body = await parseDecideRequest(request);
    const member = await decideMembership({
      approverId: user.uid,
      targetUserId: body.targetUserId,
      decision: body.decision,
    });
    return NextResponse.json<VoiceChatDecideResponse>({ member });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
