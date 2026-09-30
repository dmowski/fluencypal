import { DailyQuestion, UserDailyQuestion } from './types';

export const userDailyQuestionDayKey = (now: Date = new Date()): string => {
  return now.toISOString().slice(0, 10);
};

export const userDailyQuestionId = (authorUserId: string, dayKey: string): string => {
  return `${authorUserId}_${dayKey}`;
};

export const toCommunityDailyQuestion = (question: UserDailyQuestion): DailyQuestion => {
  return {
    id: question.id,
    title: question.title,
    description: question.description,
    exampleAnswer: '',
    hints: [],
    minWords: 1,
    imageUrl: question.imageUrl,
  };
};

export const splitUserDailyQuestions = (
  questions: readonly UserDailyQuestion[],
  now: Date = new Date(),
): { todays: UserDailyQuestion[]; previous: UserDailyQuestion[] } => {
  const today = userDailyQuestionDayKey(now);
  const sorted = [...questions].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  return {
    todays: sorted.filter((question) => question.dayKey === today),
    previous: sorted.filter((question) => question.dayKey !== today),
  };
};

export const canDeleteUserDailyQuestion = (
  question: UserDailyQuestion,
  userId: string | null | undefined,
  isFounder: boolean,
): boolean => {
  if (!userId) return false;
  return isFounder || question.authorUserId === userId;
};

export const canEditUserDailyQuestion = (isFounder: boolean): boolean => {
  return isFounder;
};
