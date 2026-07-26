import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { assertVoiceChatParticipant } from '@/features/Chat/VoiceChat/backend/access';
import { getVoiceChatMessage } from '@/features/Chat/VoiceChat/backend/messages';
import { readVoiceChatAudio } from '@/features/Chat/VoiceChat/backend/storage';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import {
  VoiceChatApiError,
  VoiceChatMessageIdRouteContext,
} from '@/features/Chat/VoiceChat/types';

export async function GET(request: Request, context: VoiceChatMessageIdRouteContext) {
  try {
    const user = await validateAuthToken(request);
    await assertVoiceChatParticipant(user.uid);
    const { messageId } = await context.params;
    const message = await getVoiceChatMessage(messageId);
    if (!message) {
      return NextResponse.json<VoiceChatApiError>({ error: 'Not found' }, { status: 404 });
    }
    const audio = await readVoiceChatAudio(message.audioPath);
    if (!audio) {
      return NextResponse.json<VoiceChatApiError>({ error: 'Audio missing' }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(audio.buffer), {
      status: 200,
      headers: {
        'Content-Type': audio.contentType,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
