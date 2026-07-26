import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import {
  validatePaidEntitlements,
  validatePaidForUser,
} from '@/features/Chat/VoiceChat/backend/entitlements';
import {
  parseValidatePaidRequest,
  voiceChatErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import {
  VOICE_CHAT_FOUNDER_UID,
  VoiceChatApiError,
  VoiceChatValidatePaidCronResponse,
  VoiceChatValidatePaidResponse,
} from '@/features/Chat/VoiceChat/types';

export async function POST(request: Request) {
  try {
    const user = await validateAuthToken(request);
    const body = await parseValidatePaidRequest(request);
    const targetUserId = body.userId || user.uid;
    if (targetUserId !== user.uid && user.uid !== VOICE_CHAT_FOUNDER_UID) {
      return NextResponse.json<VoiceChatApiError>({ error: 'Forbidden' }, { status: 403 });
    }
    const entitlement = await validatePaidForUser(targetUserId);
    return NextResponse.json<VoiceChatValidatePaidResponse>({ entitlement });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}

export async function GET() {
  try {
    const result = await validatePaidEntitlements();
    return NextResponse.json<VoiceChatValidatePaidCronResponse>(result);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
