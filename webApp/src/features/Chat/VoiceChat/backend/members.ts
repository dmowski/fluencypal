import { getDB } from '@/app/api/config/firebase';
import { DocumentData } from 'firebase-admin/firestore';
import { ReviewDecision, RoomMember, RoomMembershipStatus, SpeakingRoom } from '../types';
import { isAlexAccount, SpeakingProfile } from './access';
import { SpeakingClubError } from './http';

const members = (roomId: string) =>
  getDB().collection('speakingRooms').doc(roomId).collection('members');

const asStatus = (value: unknown): RoomMembershipStatus => {
  if (value === 'approved' || value === 'rejected' || value === 'pending') return value;
  return 'pending';
};

const withoutUndefined = (value: object): Record<string, unknown> =>
  Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined));

export const toRoomMember = (data: DocumentData, docId = ''): RoomMember => {
  const approvals: Record<string, ReviewDecision> = {};
  if (data.approvals && typeof data.approvals === 'object') {
    for (const [userId, decision] of Object.entries(data.approvals as Record<string, unknown>)) {
      if (decision === 'approved' || decision === 'rejected') approvals[userId] = decision;
    }
  }
  return {
    userId: typeof data.userId === 'string' && data.userId ? data.userId : docId,
    status: asStatus(data.status),
    username: typeof data.username === 'string' ? data.username : 'Learner',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
    description: typeof data.description === 'string' ? data.description : '',
    introAudioPath: typeof data.introAudioPath === 'string' ? data.introAudioPath : '',
    introTranscript: typeof data.introTranscript === 'string' ? data.introTranscript : '',
    introSuggestion: typeof data.introSuggestion === 'string' ? data.introSuggestion : '',
    introDurationSec: typeof data.introDurationSec === 'number' ? data.introDurationSec : 0,
    requestedAtIso: typeof data.requestedAtIso === 'string' ? data.requestedAtIso : '',
    decidedAtIso: typeof data.decidedAtIso === 'string' ? data.decidedAtIso : undefined,
    lastOnlineIso: typeof data.lastOnlineIso === 'string' ? data.lastOnlineIso : undefined,
    approvals,
  };
};

export const getRoomMember = async (roomId: string, userId: string): Promise<RoomMember | null> => {
  const snap = await members(roomId).doc(userId).get();
  if (!snap.exists) return null;
  return toRoomMember(snap.data() || {}, snap.id);
};

export const listRoomMembers = async (roomId: string): Promise<RoomMember[]> => {
  const snap = await members(roomId).get();
  return snap.docs
    .map((doc) => toRoomMember(doc.data(), doc.id))
    .sort((a, b) => a.username.localeCompare(b.username));
};

const descriptionFromTranscript = (transcript: string): string => {
  const clean = transcript.replace(/\s+/g, ' ').trim();
  if (clean.length <= 280) return clean;
  return `${clean.slice(0, 277)}...`;
};

export const canReviewMember = (params: {
  room: SpeakingRoom;
  actorId: string;
  actorEmail: string | null;
  actorStatus: RoomMembershipStatus | null;
}): boolean => {
  if (params.room.reviewMode === 'alexOnly') {
    return isAlexAccount({ uid: params.actorId, email: params.actorEmail });
  }
  return params.actorStatus === 'approved';
};

export const submitJoinRequest = async (params: {
  room: SpeakingRoom;
  profile: SpeakingProfile;
  introAudioPath: string;
  introTranscript: string;
  introSuggestion: string;
  introDurationSec: number;
}): Promise<RoomMember> => {
  if (params.introDurationSec < 3) {
    throw new SpeakingClubError('The recording is too short. Try again and say a little more.');
  }
  const existing = await getRoomMember(params.room.id, params.profile.userId);
  if (existing?.status === 'approved') {
    throw new SpeakingClubError('You are already in this room.');
  }
  if (existing?.status === 'pending') {
    throw new SpeakingClubError('Your introduction is already being reviewed.');
  }
  const now = new Date().toISOString();
  const member: RoomMember = {
    userId: params.profile.userId,
    status: 'pending',
    username: params.profile.username,
    avatarUrl: params.profile.avatarUrl,
    description: descriptionFromTranscript(params.introTranscript),
    introAudioPath: params.introAudioPath,
    introTranscript: params.introTranscript.slice(0, 8000),
    introSuggestion: params.introSuggestion.slice(0, 2000),
    introDurationSec: params.introDurationSec,
    requestedAtIso: now,
    approvals: {},
  };
  await members(params.room.id).doc(params.profile.userId).set(member);
  return member;
};

export const decideJoinRequest = async (params: {
  room: SpeakingRoom;
  actorId: string;
  actorEmail: string | null;
  targetUserId: string;
  decision: ReviewDecision;
}): Promise<RoomMember> => {
  const actor = await getRoomMember(params.room.id, params.actorId);
  if (
    !canReviewMember({
      room: params.room,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorStatus: actor?.status || null,
    })
  ) {
    throw new SpeakingClubError('You cannot review people for this room.', 403);
  }
  const target = await getRoomMember(params.room.id, params.targetUserId);
  if (!target || target.status === 'approved') {
    throw new SpeakingClubError('That introduction is not waiting anymore.', 404);
  }
  const now = new Date().toISOString();
  const approvals = { ...target.approvals, [params.actorId]: params.decision };
  let status: RoomMembershipStatus = 'pending';
  if (params.decision === 'rejected' || params.room.reviewMode === 'alexOnly') {
    status = params.decision;
  } else {
    const approvedMembers = (await listRoomMembers(params.room.id)).filter(
      (member) => member.status === 'approved',
    );
    const everyoneApproved =
      approvedMembers.length > 0 &&
      approvedMembers.every((member) => approvals[member.userId] === 'approved');
    if (everyoneApproved) status = 'approved';
  }
  const next: RoomMember = {
    ...target,
    approvals,
    status,
    ...(status === 'pending' ? {} : { decidedAtIso: now }),
  };
  await members(params.room.id)
    .doc(target.userId || params.targetUserId)
    .set(withoutUndefined(next));
  if (status === 'approved') {
    const approvedCount = (await listRoomMembers(params.room.id)).filter(
      (member) => member.status === 'approved',
    ).length;
    await getDB()
      .collection('speakingRooms')
      .doc(params.room.id)
      .set({ memberCount: approvedCount }, { merge: true });
  }
  return next;
};

export const touchRoomPresence = async (params: {
  roomId: string;
  profile: SpeakingProfile;
}): Promise<void> => {
  const member = await getRoomMember(params.roomId, params.profile.userId);
  if (!member || member.status !== 'approved') return;
  await members(params.roomId).doc(params.profile.userId).set(
    {
      lastOnlineIso: new Date().toISOString(),
      username: params.profile.username,
      avatarUrl: params.profile.avatarUrl,
    },
    { merge: true },
  );
};
