import { CreateNewsQuizInput } from './types';

const pendingByQuizId = new Map<string, CreateNewsQuizInput>();

export const setPendingNewsQuizCreate = (quizId: string, input: CreateNewsQuizInput): void => {
  pendingByQuizId.set(quizId, input);
};

export const consumePendingNewsQuizCreate = (quizId: string): CreateNewsQuizInput | null => {
  const input = pendingByQuizId.get(quizId) ?? null;
  pendingByQuizId.delete(quizId);
  return input;
};
