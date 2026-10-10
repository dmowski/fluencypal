import { getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { UserChatMetadata } from '@/features/Chat/type';

/** One room for every group conversation. Not keyed by call id or language. */
export const FLUENCY_CALL_COMMUNITY_SPACE_ID = 'fluencyCall_community';

export const fluencyCallChatSpaceId = (callId: string) => `fluencyCall_${callId}`;

async function ensureFluencyCallSpace(userId: string, spaceId: string) {
  const ref = db.documents.chat(userId, spaceId);
  if (!ref) return;

  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const metadata: UserChatMetadata = {
    spaceId,
    allowedUserIds: null,
    isPrivate: false,
    type: 'fluencyCall',
    allMessagesIds: null,
    allMessagesIdsAuthorsMap: null,
  };
  await setDoc(ref, metadata);
}

export async function ensureFluencyCallCommunityChat(userId: string) {
  await ensureFluencyCallSpace(userId, FLUENCY_CALL_COMMUNITY_SPACE_ID);
}

export async function ensureFluencyCallChat(userId: string, callId: string) {
  await ensureFluencyCallSpace(userId, fluencyCallChatSpaceId(callId));
}
