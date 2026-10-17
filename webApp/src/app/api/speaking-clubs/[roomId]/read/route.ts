import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { markRoomRead } from '@/features/Chat/VoiceChat/backend/notifications';

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    await markRoomRead(user.uid, roomId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
