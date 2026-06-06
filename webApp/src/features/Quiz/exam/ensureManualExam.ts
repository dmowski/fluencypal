'use client';

import { getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { createInitialQuizProgress, QuizDocument, UserQuizRecord } from '../types';
import { sanitizeForFirestore } from '../sanitizeForFirestore';

export const ensureManualExam = async (
  userId: string,
  quiz: QuizDocument,
): Promise<UserQuizRecord | null> => {
  const docRef = db.documents.quiz(userId, quiz.id);
  if (!docRef) return null;

  const existing = await getDoc(docRef);
  if (existing.exists()) {
    return existing.data() as UserQuizRecord;
  }

  const now = new Date().toISOString();
  const record: UserQuizRecord = {
    quiz,
    progress: createInitialQuizProgress(quiz.id),
    createdAtIso: now,
    updatedAtIso: now,
  };

  await setDoc(docRef, sanitizeForFirestore(record));
  return record;
};
