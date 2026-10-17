import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { assertApprovedMember, getRoomMessage } from '@/features/Chat/VoiceChat/backend/messages';
import { readSpeakingAudio } from '@/features/Chat/VoiceChat/backend/storage';

export async function GET(
  request: Request,
  context: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId, messageId } = await context.params;
    await assertApprovedMember(roomId, user.uid);
    const message = await getRoomMessage(roomId, messageId);
    if (!message)
      return NextResponse.json({ error: 'That message is already gone.' }, { status: 404 });
    const audio = await readSpeakingAudio(message.audioPath);
    if (!audio) return NextResponse.json({ error: 'That recording is missing.' }, { status: 404 });
    return new NextResponse(new Uint8Array(audio.buffer), {
      headers: {
        'Content-Type': audio.contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
