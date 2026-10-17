import { NextResponse } from 'next/server';
import {
  isAlexAccount,
  loadSpeakingProfile,
  requireSpeakingUser,
} from '@/features/Chat/VoiceChat/backend/access';
import { parseRoomDraft } from '@/features/Chat/VoiceChat/backend/forms';
import {
  asRecord,
  readJson,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import {
  canReviewMember,
  getRoomMember,
  listRoomMembers,
  touchRoomPresence,
} from '@/features/Chat/VoiceChat/backend/members';
import { listRoomMessages } from '@/features/Chat/VoiceChat/backend/messages';
import { getSpeakingRoom, updateSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { RoomMember } from '@/features/Chat/VoiceChat/types';

const visibleMember = (member: RoomMember, includeIntro: boolean): RoomMember => {
  if (includeIntro) return member;
  return {
    ...member,
    introAudioPath: '',
    introTranscript: '',
    introSuggestion: '',
    approvals: {},
  };
};

export async function GET(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const profile = await loadSpeakingProfile(user.uid);
    await touchRoomPresence({ roomId, profile });
    const membership = await getRoomMember(roomId, user.uid);
    const isAdmin = room.creatorId === user.uid || isAlexAccount(user);
    const canReview = canReviewMember({
      room,
      actorId: user.uid,
      actorEmail: user.email,
      actorStatus: membership?.status || null,
    });
    const members = (await listRoomMembers(roomId))
      .filter(
        (member) => member.status === 'approved' || (canReview && member.status === 'pending'),
      )
      .map((member) => visibleMember(member, canReview && member.status === 'pending'));
    const messages = await listRoomMessages(roomId, user.uid);
    return NextResponse.json({ room, membership, members, messages, isAdmin, canReview });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    const input = parseRoomDraft(asRecord(await readJson(request)));
    const room = await updateSpeakingRoom({
      roomId,
      actorId: user.uid,
      actorEmail: user.email,
      input,
    });
    return NextResponse.json({ room });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
