import { getDB } from '@/app/api/config/firebase';
import { CONFIG_COLLECTION, CONFIG_DOC } from './paths';
import { VOICE_CHAT_FOUNDER_UID, VoiceChatConfig } from '../types';

export const getVoiceChatConfig = async (): Promise<VoiceChatConfig> => {
  const db = getDB();
  const snap = await db.collection(CONFIG_COLLECTION).doc(CONFIG_DOC).get();
  if (!snap.exists) {
    const seed: VoiceChatConfig = { approverIds: [VOICE_CHAT_FOUNDER_UID] };
    await db.collection(CONFIG_COLLECTION).doc(CONFIG_DOC).set(seed);
    return seed;
  }
  const data = snap.data() as VoiceChatConfig;
  const approverIds =
    Array.isArray(data.approverIds) && data.approverIds.length > 0
      ? data.approverIds
      : [VOICE_CHAT_FOUNDER_UID];
  if (!data.approverIds?.length) {
    await db.collection(CONFIG_COLLECTION).doc(CONFIG_DOC).set({ approverIds }, { merge: true });
  }
  return { approverIds };
};

export const isVoiceChatApprover = async (uid: string): Promise<boolean> => {
  const config = await getVoiceChatConfig();
  return config.approverIds.includes(uid);
};
