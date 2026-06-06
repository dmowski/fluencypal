'use client';

import { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import {
  clearPendingNewsQuizCreate,
  getPendingNewsQuizCreate,
} from '../pendingNewsQuizCreate';
import { CreateNewsQuizInput } from '../types';

const autoStartedQuizIds = new Set<string>();

export const useAutoCreatePendingNewsQuiz = (
  quizId: string,
  ensureNewsQuiz: (input: CreateNewsQuizInput) => Promise<unknown>,
) => {
  const { i18n } = useLingui();
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const createQuiz = async (input: CreateNewsQuizInput) => {
    setIsBootstrapping(true);
    setBootstrapError(null);
    try {
      await ensureNewsQuiz(input);
      clearPendingNewsQuizCreate(quizId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n._('Failed to generate quiz.');
      setBootstrapError(message);
    } finally {
      setIsBootstrapping(false);
      autoStartedQuizIds.delete(quizId);
    }
  };

  useEffect(() => {
    const pending = getPendingNewsQuizCreate(quizId);
    if (!pending || autoStartedQuizIds.has(quizId)) return;
    autoStartedQuizIds.add(quizId);
    void createQuiz(pending);
  }, [quizId]);

  const retryCreate = () => {
    if (isBootstrapping) return;
    const pending = getPendingNewsQuizCreate(quizId);
    if (!pending) {
      setBootstrapError(i18n._('Quiz not found. Open it from the news article.'));
      return;
    }
    void createQuiz(pending);
  };

  return {
    isBootstrapping,
    bootstrapError,
    retryCreate,
    hasPendingCreate: Boolean(getPendingNewsQuizCreate(quizId)),
  };
};
