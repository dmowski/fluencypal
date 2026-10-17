import { getDB } from '@/app/api/config/firebase';
import { DocumentData } from 'firebase-admin/firestore';
import { RoomMessage, SpeakingRoom } from '../types';
import { SpeakingProfile } from './access';
import { SpeakingClubError } from './http';
import { getRoomMember } from './members';
import { notifyNewMessage } from './notifications';
import { deleteSpeakingAudio } from './storage';
import { messageForVisitor } from './guards';
import { recountRecentMessages } from './rooms';

const messages = (roomId: string) =>
  getDB().collection('speakingRooms').doc(roomId).collection('messages');

const weekAgoIso = (): string => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const likeMap = (value: unknown): Record<string, true> => {
  if (!value || typeof value !== 'object') return {};
  const likes: Record<string, true> = {};
  for (const [userId, liked] of Object.entries(value as Record<string, unknown>)) {
    if (liked) likes[userId] = true;
  }
  return likes;
};

export const toRoomMessage = (
  id: string,
  roomId: string,
  data: DocumentData,
  viewerId = '',
): RoomMessage => {
  const likes = likeMap(data.likes);
  return {
    id,
    roomId,
    kind: data.kind === 'join' ? 'join' : 'voice',
    senderId: typeof data.senderId === 'string' ? data.senderId : '',
    senderName: typeof data.senderName === 'string' ? data.senderName : 'Learner',
    senderAvatarUrl: typeof data.senderAvatarUrl === 'string' ? data.senderAvatarUrl : '',
    audioPath: typeof data.audioPath === 'string' ? data.audioPath : '',
    durationSec: typeof data.durationSec === 'number' ? data.durationSec : 0,
    transcript: typeof data.transcript === 'string' ? data.transcript : '',
    correctedTranscript:
      typeof data.correctedTranscript === 'string' ? data.correctedTranscript : '',
    createdAtIso: typeof data.createdAtIso === 'string' ? data.createdAtIso : '',
    likeCount: typeof data.likeCount === 'number' ? data.likeCount : Object.keys(likes).length,
    likedByMe: Boolean(viewerId && likes[viewerId]),
  };
};

export const assertApprovedMember = async (roomId: string, userId: string): Promise<void> => {
  const member = await getRoomMember(roomId, userId);
  if (member?.status !== 'approved') {
    throw new SpeakingClubError('Join this room before you speak.', 403);
  }
};

const dropOldMessages = async (roomId: string): Promise<void> => {
  const old = await messages(roomId).where('createdAtIso', '<', weekAgoIso()).limit(30).get();
  await Promise.all(
    old.docs.map(async (item) => {
      const audioPath = item.data().audioPath;
      if (typeof audioPath === 'string') await deleteSpeakingAudio(audioPath);
      await item.ref.delete();
    }),
  );
};

export const listRoomMessages = async (
  roomId: string,
  viewerId = '',
  options?: { includePrivate?: boolean },
): Promise<RoomMessage[]> => {
  await dropOldMessages(roomId).catch((error) => {
    console.error('Could not remove old speaking club messages', error);
  });
  const snap = await messages(roomId)
    .where('createdAtIso', '>=', weekAgoIso())
    .orderBy('createdAtIso', 'asc')
    .limit(200)
    .get();
  return snap.docs.map((doc) => {
    const message = toRoomMessage(doc.id, roomId, doc.data(), viewerId);
    return options?.includePrivate ? message : messageForVisitor(message);
  });
};

export const getRoomMessage = async (
  roomId: string,
  messageId: string,
): Promise<RoomMessage | null> => {
  const snap = await messages(roomId).doc(messageId).get();
  if (!snap.exists) return null;
  return toRoomMessage(snap.id, roomId, snap.data() || {});
};

export const createRoomMessage = async (params: {
  room: SpeakingRoom;
  profile: SpeakingProfile;
  audioPath: string;
  durationSec: number;
  transcript: string;
  correctedTranscript: string;
}): Promise<RoomMessage> => {
  await assertApprovedMember(params.room.id, params.profile.userId);
  if (params.durationSec < 1) throw new SpeakingClubError('That recording is too short.');
  const ref = messages(params.room.id).doc();
  const message: RoomMessage = {
    id: ref.id,
    roomId: params.room.id,
    senderId: params.profile.userId,
    senderName: params.profile.username,
    senderAvatarUrl: params.profile.avatarUrl,
    audioPath: params.audioPath,
    durationSec: params.durationSec,
    transcript: params.transcript.slice(0, 8000),
    correctedTranscript: params.correctedTranscript.slice(0, 8000),
    createdAtIso: new Date().toISOString(),
    kind: 'voice',
    likeCount: 0,
    likedByMe: false,
  };
  await ref.set({ ...message, likes: {} });
  await recountRecentMessages(params.room.id);
  try {
    await notifyNewMessage({
      room: params.room,
      senderId: params.profile.userId,
      senderName: params.profile.username,
    });
  } catch (error) {
    console.error('Speaking club message notification failed', error);
  }
  return message;
};

export const createJoinNotice = async (params: {
  room: SpeakingRoom;
  userId: string;
  username: string;
}): Promise<void> => {
  const ref = messages(params.room.id).doc();
  await ref.set({
    id: ref.id,
    roomId: params.room.id,
    kind: 'join',
    senderId: params.userId,
    senderName: params.username || 'Someone',
    senderAvatarUrl: '',
    audioPath: '',
    durationSec: 0,
    transcript: '',
    correctedTranscript: '',
    createdAtIso: new Date().toISOString(),
    likeCount: 0,
    likes: {},
  });
};

export const toggleMessageLike = async (params: {
  roomId: string;
  messageId: string;
  userId: string;
}): Promise<RoomMessage> => {
  await assertApprovedMember(params.roomId, params.userId);
  const ref = messages(params.roomId).doc(params.messageId);
  const snap = await ref.get();
  if (!snap.exists) throw new SpeakingClubError('That message is already gone.', 404);
  const data = snap.data() || {};
  if (data.kind === 'join') throw new SpeakingClubError('That note cannot be liked.');
  const likes = likeMap(data.likes);
  if (likes[params.userId]) delete likes[params.userId];
  else likes[params.userId] = true;
  const likeCount = Object.keys(likes).length;
  await ref.set({ likes, likeCount }, { merge: true });
  return toRoomMessage(snap.id, params.roomId, { ...data, likes, likeCount }, params.userId);
};

export const deleteRoomMessage = async (params: {
  roomId: string;
  messageId: string;
  actorId: string;
  asModerator: boolean;
}): Promise<void> => {
  const message = await getRoomMessage(params.roomId, params.messageId);
  if (!message) throw new SpeakingClubError('That message is already gone.', 404);
  const ownsIt = message.senderId === params.actorId;
  if (!ownsIt && !params.asModerator) {
    throw new SpeakingClubError('You can only remove your own message.', 403);
  }
  await messages(params.roomId).doc(params.messageId).delete();
  await deleteSpeakingAudio(message.audioPath);
  if (!ownsIt) {
    await getDB().collection('speakingModeration').add({
      action: 'deleteMessage',
      actorId: params.actorId,
      roomId: params.roomId,
      messageId: params.messageId,
      createdAtIso: new Date().toISOString(),
    });
  }
  await recountRecentMessages(params.roomId);
};
