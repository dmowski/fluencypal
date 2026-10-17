import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { canReviewMember, getRoomMember } from '@/features/Chat/VoiceChat/backend/members';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { readSpeakingAudio } from '@/features/Chat/VoiceChat/backend/storage';

export async function GET(
  request: Request,
  context: { params: Promise<{ roomId: string; userId: string }> },
) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId, userId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const actor = await getRoomMember(roomId, user.uid);
    const allowed =
      user.uid === userId ||
      canReviewMember({
        room,
        actorId: user.uid,
        actorEmail: user.email,
        actorStatus: actor?.status || null,
      });
    if (!allowed)
      return NextResponse.json({ error: 'You cannot play this introduction.' }, { status: 403 });
    const member = await getRoomMember(roomId, userId);
    if (!member?.introAudioPath) {
      return NextResponse.json({ error: 'That recording is missing.' }, { status: 404 });
    }
    const audio = await readSpeakingAudio(member.introAudioPath);
    if (!audio) return NextResponse.json({ error: 'That recording is missing.' }, { status: 404 });
    return new NextResponse(new Uint8Array(audio.buffer), {
      headers: { 'Content-Type': audio.contentType, 'Cache-Control': 'private, max-age=3600' },
    });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
