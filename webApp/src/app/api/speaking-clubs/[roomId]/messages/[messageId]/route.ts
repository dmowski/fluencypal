import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { deleteOwnRoomMessage } from '@/features/Chat/VoiceChat/backend/messages';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId, messageId } = await context.params;
    await deleteOwnRoomMessage({ roomId, messageId, userId: user.uid });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
