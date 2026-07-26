import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { assertVoiceChatParticipant } from '@/features/Chat/VoiceChat/backend/access';
import { deleteMessageCascade } from '@/features/Chat/VoiceChat/backend/messages';
import { voiceChatErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import {
  VoiceChatDeleteMessageResponse,
  VoiceChatMessageIdRouteContext,
} from '@/features/Chat/VoiceChat/types';

export async function DELETE(request: Request, context: VoiceChatMessageIdRouteContext) {
  try {
    const user = await validateAuthToken(request);
    await assertVoiceChatParticipant(user.uid);
    const { messageId } = await context.params;
    const result = await deleteMessageCascade({
      actorId: user.uid,
      messageId,
    });
    return NextResponse.json<VoiceChatDeleteMessageResponse>(result);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
