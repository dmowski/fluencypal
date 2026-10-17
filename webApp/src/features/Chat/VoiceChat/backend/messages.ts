import { getDB } from '@/app/api/config/firebase';
import { DocumentData } from 'firebase-admin/firestore';
import { RoomMessage, SpeakingRoom } from '../types';
import { SpeakingProfile } from './access';
import { SpeakingClubError } from './http';
import { getRoomMember } from './members';
import { notifyNewMessage } from './notifications';
import { deleteSpeakingAudio } from './storage';
import { recountRecentMessages } from './rooms';

const messages = (roomId: string) =>
  getDB().collection('speakingRooms').doc(roomId).collection('messages');

export const toRoomMessage = (id: string, roomId: string, data: DocumentData): RoomMessage => ({
  id,
  roomId,
  senderId: typeof data.senderId === 'string' ? data.senderId : '',
  senderName: typeof data.senderName === 'string' ? data.senderName : 'Learner',
  senderAvatarUrl: typeof data.senderAvatarUrl === 'string' ? data.senderAvatarUrl : '',
  audioPath: typeof data.audioPath === 'string' ? data.audioPath : '',
  durationSec: typeof data.durationSec === 'number' ? data.durationSec : 0,
  transcript: typeof data.transcript === 'string' ? data.transcript : '',
  correctedTranscript: typeof data.correctedTranscript === 'string' ? data.correctedTranscript : '',
  createdAtIso: typeof data.createdAtIso === 'string' ? data.createdAtIso : '',
});

export const assertApprovedMember = async (roomId: string, userId: string): Promise<void> => {
  const member = await getRoomMember(roomId, userId);
  if (member?.status !== 'approved') {
    throw new SpeakingClubError('Join this room before you speak.', 403);
  }
};

export const listRoomMessages = async (roomId: string): Promise<RoomMessage[]> => {
  const snap = await messages(roomId).orderBy('createdAtIso', 'asc').limit(200).get();
  return snap.docs.map((doc) => toRoomMessage(doc.id, roomId, doc.data()));
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
  };
  await ref.set(message);
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

export const deleteOwnRoomMessage = async (params: {
  roomId: string;
  messageId: string;
  userId: string;
}): Promise<void> => {
  const message = await getRoomMessage(params.roomId, params.messageId);
  if (!message) throw new SpeakingClubError('That message is already gone.', 404);
  if (message.senderId !== params.userId) {
    throw new SpeakingClubError('You can only remove your own message.', 403);
  }
  await messages(params.roomId).doc(params.messageId).delete();
  await deleteSpeakingAudio(message.audioPath);
  await recountRecentMessages(params.roomId);
};
