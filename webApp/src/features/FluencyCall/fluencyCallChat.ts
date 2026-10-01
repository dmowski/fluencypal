import { getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { UserChatMetadata } from '@/features/Chat/type';

export const fluencyCallChatSpaceId = (callId: string) => `fluencyCall_${callId}`;

export async function ensureFluencyCallChat(userId: string, callId: string) {
  const spaceId = fluencyCallChatSpaceId(callId);
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
