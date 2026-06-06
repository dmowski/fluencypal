import { getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';

/** Records a quiz completion when the user finishes and receives a final score. */
export const recordQuizCompletion = async (userId: string, quizId: string): Promise<void> => {
  const docRef = db.documents.quizStats(quizId);
  if (!docRef) return;

  const nowIso = new Date().toISOString();
  const existing = (await getDoc(docRef)).data();
  const completionsUserIds = {
    ...(existing?.completionsUserIds ?? {}),
    [userId]: nowIso,
  };

  await setDoc(
    docRef,
    {
      completionsUserIds,
      updatedAtIso: nowIso,
    },
    { merge: true },
  );
};
