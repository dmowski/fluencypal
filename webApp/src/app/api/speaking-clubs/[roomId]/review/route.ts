import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import {
  asRecord,
  readJson,
  readText,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { decideJoinRequest } from '@/features/Chat/VoiceChat/backend/members';
import { createJoinNotice } from '@/features/Chat/VoiceChat/backend/messages';
import { notifyApplicant } from '@/features/Chat/VoiceChat/backend/notifications';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { ReviewDecision } from '@/features/Chat/VoiceChat/types';

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const body = asRecord(await readJson(request));
    const decision: ReviewDecision = body.decision === 'rejected' ? 'rejected' : 'approved';
    const targetUserId = readText(body.targetUserId, 128, 'Person');
    const member = await decideJoinRequest({
      room,
      actorId: user.uid,
      actorEmail: user.email,
      targetUserId,
      decision,
    });
    if (member.status === 'approved' || member.status === 'rejected') {
      await notifyApplicant({ room, applicantId: member.userId, decision: member.status });
    }
    if (member.status === 'approved') {
      await createJoinNotice({ room, userId: member.userId, username: member.username });
    }
    return NextResponse.json({ member });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
