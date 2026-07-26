import { getDB } from '@/app/api/config/firebase';
import { MESSAGES_COLLECTION } from './paths';
import { deleteVoiceChatAudio, readVoiceChatAudio, saveVoiceChatAudio } from './storage';
import { assertVoiceChatParticipant, VoiceChatAccessError } from './access';
import {
  VoiceChatDeletedIdsResponse,
  VoiceChatMember,
  VoiceChatMessage,
  VoiceChatReadMetadata,
} from '../types';
import { collectSubtreeIds } from './messageTree';
import { randomUUID } from 'crypto';

export { collectSubtreeIds } from './messageTree';

export const listVoiceChatMessages = async (): Promise<VoiceChatMessage[]> => {
  const db = getDB();
  const snap = await db.collection(MESSAGES_COLLECTION).orderBy('createdAtUtc', 'asc').get();
  return snap.docs.map((d) => d.data() as VoiceChatMessage);
};

export const getVoiceChatMessage = async (messageId: string): Promise<VoiceChatMessage | null> => {
  const db = getDB();
  const snap = await db.collection(MESSAGES_COLLECTION).doc(messageId).get();
  if (!snap.exists) return null;
  return snap.data() as VoiceChatMessage;
};

export const createVoiceChatMessage = async (params: {
  senderId: string;
  parentMessageId: string;
  audioBuffer: Buffer;
  contentType: string;
  durationSec: number;
  isIntro?: boolean;
}): Promise<VoiceChatMessage> => {
  if (!params.isIntro) {
    await assertVoiceChatParticipant(params.senderId);
  }
  if (params.parentMessageId) {
    const parent = await getVoiceChatMessage(params.parentMessageId);
    if (!parent) {
      throw new VoiceChatAccessError('Parent message not found', 404);
    }
  }

  const id = randomUUID();
  const { audioPath, contentType } = await saveVoiceChatAudio({
    id,
    buffer: params.audioBuffer,
    contentType: params.contentType,
  });

  const now = Date.now();
  const message: VoiceChatMessage = {
    id,
    senderId: params.senderId,
    parentMessageId: params.parentMessageId || '',
    audioPath,
    durationSec: params.durationSec,
    contentType,
    createdAtIso: new Date(now).toISOString(),
    createdAtUtc: now,
    isIntro: params.isIntro || false,
  };

  const db = getDB();
  await db.collection(MESSAGES_COLLECTION).doc(id).set(message);
  return message;
};

export const createIntroMessageFromMember = async (
  member: VoiceChatMember,
): Promise<VoiceChatMessage> => {
  const audio = await readVoiceChatAudio(member.introAudioPath);
  if (!audio) {
    throw new VoiceChatAccessError('Intro audio missing', 500);
  }

  const id = randomUUID();
  const now = Date.now();
  // Reuse the same private object path; no public copy.
  const message: VoiceChatMessage = {
    id,
    senderId: member.userId,
    parentMessageId: '',
    audioPath: member.introAudioPath,
    durationSec: member.introDurationSec,
    contentType: member.introContentType || audio.contentType,
    createdAtIso: new Date(now).toISOString(),
    createdAtUtc: now,
    isIntro: true,
  };

  const db = getDB();
  await db.collection(MESSAGES_COLLECTION).doc(id).set(message);
  return message;
};

export const getReadMetadata = async (uid: string): Promise<VoiceChatReadMetadata> => {
  const db = getDB();
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('stats')
    .doc('voiceChatReadMetadata')
    .get();
  if (!snap.exists) return {};
  return (snap.data() as VoiceChatReadMetadata) || {};
};

export const markMessageListened = async (uid: string, messageId: string): Promise<void> => {
  await assertVoiceChatParticipant(uid);
  const message = await getVoiceChatMessage(messageId);
  if (!message) {
    throw new VoiceChatAccessError('Message not found', 404);
  }
  const db = getDB();
  await db
    .collection('users')
    .doc(uid)
    .collection('stats')
    .doc('voiceChatReadMetadata')
    .set({ [messageId]: true }, { merge: true });
};

export const deleteMessageCascade = async (params: {
  actorId: string;
  messageId: string;
  allowAnyOwnedSubtree?: boolean;
}): Promise<VoiceChatDeletedIdsResponse> => {
  const message = await getVoiceChatMessage(params.messageId);
  if (!message) {
    throw new VoiceChatAccessError('Message not found', 404);
  }
  if (message.senderId !== params.actorId) {
    throw new VoiceChatAccessError('You can only remove your own messages', 403);
  }

  const all = await listVoiceChatMessages();
  const ids = collectSubtreeIds(params.messageId, all);
  const toDelete = all.filter((m) => ids.includes(m.id));

  // Only delete audio objects that are not shared as another remaining message's path.
  const remainingPaths = new Set(
    all.filter((m) => !ids.includes(m.id)).map((m) => m.audioPath),
  );

  const db = getDB();
  const batch = db.batch();
  for (const id of ids) {
    batch.delete(db.collection(MESSAGES_COLLECTION).doc(id));
  }
  await batch.commit();

  await Promise.all(
    toDelete.map(async (m) => {
      if (!remainingPaths.has(m.audioPath)) {
        await deleteVoiceChatAudio(m.audioPath);
      }
    }),
  );

  return { deletedIds: ids };
};

export const cleanupExpiredMessages = async (
  ttlDays: number,
): Promise<VoiceChatDeletedIdsResponse> => {
  const cutoff = Date.now() - ttlDays * 24 * 60 * 60 * 1000;
  const all = await listVoiceChatMessages();
  const expiredRoots = all.filter((m) => !m.parentMessageId && m.createdAtUtc < cutoff);

  const deletedIds: string[] = [];
  for (const root of expiredRoots) {
    const ids = collectSubtreeIds(root.id, all);
    const toDelete = all.filter((m) => ids.includes(m.id));
    const remainingPaths = new Set(
      all.filter((m) => !ids.includes(m.id) && !deletedIds.includes(m.id)).map((m) => m.audioPath),
    );

    const db = getDB();
    const batch = db.batch();
    for (const id of ids) {
      batch.delete(db.collection(MESSAGES_COLLECTION).doc(id));
      deletedIds.push(id);
    }
    await batch.commit();

    await Promise.all(
      toDelete.map(async (m) => {
        if (!remainingPaths.has(m.audioPath)) {
          await deleteVoiceChatAudio(m.audioPath);
        }
      }),
    );
  }

  return { deletedIds: [...new Set(deletedIds)] };
};

export const countUnread = async (uid: string): Promise<number> => {
  const [messages, read] = await Promise.all([listVoiceChatMessages(), getReadMetadata(uid)]);
  return messages.filter((m) => m.senderId !== uid && !read[m.id]).length;
};
