import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { removeRoomMember } from '@/features/Chat/VoiceChat/backend/members';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ roomId: string; userId: string }> },
) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId, userId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    await removeRoomMember({
      room,
      actorId: user.uid,
      actorEmail: user.email,
      targetUserId: userId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
