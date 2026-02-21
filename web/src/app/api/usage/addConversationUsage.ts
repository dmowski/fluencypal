import { getDB } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export const addConversationUsage = async ({
  userId,
  conversationId,
  usageLabel,
  usageUsd,
}: {
  userId: string;
  conversationId: string;
  usageLabel: string;
  usageUsd: number;
}) => {
  if (!conversationId) {
    console.log('No conversation id');
    return;
  }

  try {
    const db = getDB();
    const docRef = db.collection(`users/${userId}/conversations`).doc(conversationId);

    await docRef.set(
      {
        usage: {
          [usageLabel]: FieldValue.increment(usageUsd),
        },
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error adding conversation usage:', error);
  }
};
