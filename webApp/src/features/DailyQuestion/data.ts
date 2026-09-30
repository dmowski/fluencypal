import { DailyQuestion } from './types';

export const dailyQuestionImageUrls = [
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774036079435-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035398903-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035331701-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035304855-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035287672-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035201036-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035156483-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774035037754-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774034994467-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773947976503-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
];

export const isDailyQuestionImageUrl = (url: string): boolean => {
  return (dailyQuestionImageUrls as readonly string[]).includes(url);
};

export const getDailyQuestionImage = (question: DailyQuestion) => {
  if (question.imageUrl && isDailyQuestionImageUrl(question.imageUrl)) {
    return question.imageUrl;
  }
  const text = `${question.description}${question.title}`;
  const questionIndex = text.length % dailyQuestionImageUrls.length;
  return dailyQuestionImageUrls[questionIndex];
};
