import { isAlexAccount, requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { deleteRoomMessage } from '@/features/Chat/VoiceChat/backend/messages';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId, messageId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const asModerator = room.creatorId === user.uid || isAlexAccount(user);
    await deleteRoomMessage({ roomId, messageId, actorId: user.uid, asModerator });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
