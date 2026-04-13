import { FieldValue } from 'firebase-admin/firestore';
import { getDB } from '../config/firebase';
const openAIKey = process.env.OPENAI_API_KEY || '';

export const getRandomAiToken = async () => {
  try {
    const db = getDB();
    const docRef = db.collection(`aiConfig`).doc('keys');

    const data = (await docRef.get()).data() as Record<string, string>;
    const ids = Object.keys(data);
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    const token = data[randomId] as string;
    if (!token) {
      throw new Error('No token found for random id');
    }
    return {
      id: randomId,
      token,
    };
  } catch (error) {
    console.error('Error adding conversation usage:', error);
    return {
      id: 'default',
      token: openAIKey,
    };
  }
};

export const logUserTokenUsage = async (userId: string, tokenId: string) => {
  try {
    const db = getDB();
    const docRef = db.collection(`aiConfig`).doc('logs');

    await docRef.set(
      {
        [tokenId + ':' + userId]: FieldValue.increment(1),
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error logging token usage:', error);
  }
};
