import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { toggleMessageLike } from '@/features/Chat/VoiceChat/backend/messages';

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string; messageId: string }> },
) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId, messageId } = await context.params;
    const message = await toggleMessageLike({ roomId, messageId, userId: user.uid });
    return NextResponse.json({ message });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
