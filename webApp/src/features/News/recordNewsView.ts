import { setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';

/** Records that the user spent enough time on the article to count as a read. */
export const recordNewsView = async (userId: string, newsId: string): Promise<void> => {
  const docRef = db.documents.newsStats(newsId);
  if (!docRef) return;

  const nowIso = new Date().toISOString();
  await setDoc(
    docRef,
    {
      [`viewsUserIds.${userId}`]: nowIso,
      updatedAtIso: nowIso,
    },
    { merge: true },
  );
};
