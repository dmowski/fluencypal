import { SupportedLanguage } from '@/features/Lang/lang';
import { NewsLanguageComplexity } from '@/features/News/types';

export const buildNewsQuizId = (
  newsId: string,
  complexity: NewsLanguageComplexity,
  targetLanguageCode: SupportedLanguage,
): string => `news_${newsId}_${complexity}_${targetLanguageCode}`;

export const parseNewsQuizId = (
  quizId: string,
): { newsId: string; complexity: NewsLanguageComplexity; targetLanguageCode: string } | null => {
  const match = /^news_(.+)_(beginner|middle|advance)_(.+)$/.exec(quizId);
  if (!match) return null;
  return {
    newsId: match[1],
    complexity: match[2] as NewsLanguageComplexity,
    targetLanguageCode: match[3],
  };
};
