import { DailyQuestion } from './types';

export const getDailyQuestionPrefix = (languageCode: string) => {
  if (languageCode === 'en') return '';
  return languageCode + '-';
};

export const getDailyQuestionSpaceId = (question: DailyQuestion, languageCode: string) => {
  const spaceIdPrefix = getDailyQuestionPrefix(languageCode);
  return `${spaceIdPrefix}daily-question-${question.id}`;
};
