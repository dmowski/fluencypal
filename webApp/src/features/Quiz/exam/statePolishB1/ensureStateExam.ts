'use client';

import { collection, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { firestore } from '@/features/Firebase/init';
import { createInitialQuizProgress, QuizDocument, UserQuizRecord } from '../../types';
import { sanitizeForFirestore } from '../../sanitizeForFirestore';
import { getStateExamById, getStateExamVariantIds } from './stateExamCatalog';

const isEvaluatedVariant = (quizId: string, records: UserQuizRecord[]): boolean =>
  records.some(
    (record) => record.quiz.id === quizId && record.progress.status === 'evaluated',
  );

export const getCompletedStateExamVariantIds = async (userId: string): Promise<string[]> => {
  const variantIds = getStateExamVariantIds();
  const completed: string[] = [];

  await Promise.all(
    variantIds.map(async (variantId) => {
      const exam = getStateExamById(`exam_pl-b1-state_${variantId}`);
      if (!exam) return;
      const docRef = db.documents.quiz(userId, exam.id);
      if (!docRef) return;
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return;
      const record = snapshot.data() as UserQuizRecord;
      if (record.progress.status === 'evaluated') {
        completed.push(variantId);
      }
    }),
  );

  return completed;
};

export const pickNextStateExam = async (userId: string): Promise<QuizDocument | null> => {
  const variantIds = getStateExamVariantIds();
  const records: UserQuizRecord[] = [];

  for (const variantId of variantIds) {
    const exam = getStateExamById(`exam_pl-b1-state_${variantId}`);
    if (!exam) continue;
    const docRef = db.documents.quiz(userId, exam.id);
    if (!docRef) continue;
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      records.push(snapshot.data() as UserQuizRecord);
    }
  }

  for (const variantId of variantIds) {
    const exam = getStateExamById(`exam_pl-b1-state_${variantId}`);
    if (!exam) continue;
    if (!isEvaluatedVariant(exam.id, records)) {
      return exam;
    }
  }

  return getStateExamById(`exam_pl-b1-state_${variantIds[0]}`) ?? null;
};

export const ensureStateExam = async (
  userId: string,
  exam?: QuizDocument,
): Promise<UserQuizRecord | null> => {
  const quiz = exam ?? (await pickNextStateExam(userId));
  if (!quiz) return null;

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

export const listUserStateExamRecords = async (userId: string): Promise<UserQuizRecord[]> => {
  const quizzesRef = collection(firestore, `users/${userId}/quizzes`);
  const snapshot = await getDocs(quizzesRef);
  return snapshot.docs
    .map((docSnapshot) => docSnapshot.data() as UserQuizRecord)
    .filter((record) => record.quiz.source.type === 'state-exam');
};
