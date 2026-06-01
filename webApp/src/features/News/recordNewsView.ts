import { getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';

/** Records that the user spent enough time on the article to count as a read. */
export const recordNewsView = async (userId: string, newsId: string): Promise<void> => {
  const docRef = db.documents.newsStats(newsId);
  if (!docRef) return;

  const nowIso = new Date().toISOString();
  const existing = (await getDoc(docRef)).data();
  const viewsUserIds = {
    ...(existing?.viewsUserIds ?? {}),
    [userId]: nowIso,
  };

  await setDoc(
    docRef,
    {
      viewsUserIds,
      updatedAtIso: nowIso,
    },
    { merge: true },
  );
};
