import { CreateNewsQuizInput } from './types';

const pendingByQuizId = new Map<string, CreateNewsQuizInput>();

export const setPendingNewsQuizCreate = (quizId: string, input: CreateNewsQuizInput): void => {
  pendingByQuizId.set(quizId, input);
};

export const getPendingNewsQuizCreate = (quizId: string): CreateNewsQuizInput | null => {
  return pendingByQuizId.get(quizId) ?? null;
};

export const clearPendingNewsQuizCreate = (quizId: string): void => {
  pendingByQuizId.delete(quizId);
};

export const consumePendingNewsQuizCreate = (quizId: string): CreateNewsQuizInput | null => {
  const input = getPendingNewsQuizCreate(quizId);
  if (input) {
    clearPendingNewsQuizCreate(quizId);
  }
  return input;
};
