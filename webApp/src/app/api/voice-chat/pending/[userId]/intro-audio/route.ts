import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { assertApprover } from '@/features/Chat/VoiceChat/backend/access';
import { getMember } from '@/features/Chat/VoiceChat/backend/membersStore';
import { readVoiceChatAudio } from '@/features/Chat/VoiceChat/backend/storage';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import {
  VoiceChatApiError,
  VoiceChatPendingUserIdRouteContext,
} from '@/features/Chat/VoiceChat/types';

export async function GET(request: Request, context: VoiceChatPendingUserIdRouteContext) {
  try {
    const user = await validateAuthToken(request);
    await assertApprover(user.uid);
    const { userId } = await context.params;
    const member = await getMember(userId);
    if (!member || member.status !== 'pending') {
      return NextResponse.json<VoiceChatApiError>({ error: 'No pending intro' }, { status: 404 });
    }
    const audio = await readVoiceChatAudio(member.introAudioPath);
    if (!audio) {
      return NextResponse.json<VoiceChatApiError>({ error: 'Audio missing' }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(audio.buffer), {
      status: 200,
      headers: {
        'Content-Type': audio.contentType,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
