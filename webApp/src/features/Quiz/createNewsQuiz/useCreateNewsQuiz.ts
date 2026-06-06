'use client';

import { useState } from 'react';
import { getDoc, setDoc } from 'firebase/firestore';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { buildNewsQuizId } from '../buildNewsQuizId';
import {
  createInitialQuizProgress,
  CreateNewsQuizInput,
  NEWS_QUIZ_QUESTIONS_PER_TYPE,
  UserQuizRecord,
} from '../types';
import { generateNewsQuizDraft } from './generateNewsQuizDraft';
import { normalizeQuizDocument } from './normalizeQuizDocument';
import { resolveIncludedSections } from './resolveIncludedSections';
import { sanitizeForFirestore } from '../sanitizeForFirestore';

export const useCreateNewsQuiz = () => {
  const auth = useAuth();
  const textAi = useTextAi();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const ensureNewsQuiz = async (input: CreateNewsQuizInput): Promise<UserQuizRecord | null> => {
    const userId = auth.uid;
    if (!userId) return null;

    const quizId = buildNewsQuizId(input.newsId, input.complexity, input.targetLanguageCode);
    const docRef = db.documents.quiz(userId, quizId);
    if (!docRef) return null;

    const existing = await getDoc(docRef);
    if (existing.exists()) {
      return existing.data() as UserQuizRecord;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const sections = resolveIncludedSections({
        targetLanguageCode: input.targetLanguageCode,
        nativeLanguageCode: input.nativeLanguageCode,
        imageUrl: input.imageUrl,
        questionsPerType: NEWS_QUIZ_QUESTIONS_PER_TYPE,
      });

      if (sections.length === 0) {
        throw new Error('No quiz sections available for this article and language settings.');
      }

      const parsed = await generateNewsQuizDraft({ input, sections, textAi });
      const quiz = normalizeQuizDocument(parsed, input);
      if (quiz.sections.length === 0) {
        throw new Error('Generated quiz has no valid sections.');
      }

      const now = new Date().toISOString();
      const record: UserQuizRecord = {
        quiz,
        progress: createInitialQuizProgress(quizId),
        createdAtIso: now,
        updatedAtIso: now,
      };

      await setDoc(docRef, sanitizeForFirestore(record));
      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create quiz';
      setCreateError(message);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    ensureNewsQuiz,
    isCreating,
    createError,
  };
};
