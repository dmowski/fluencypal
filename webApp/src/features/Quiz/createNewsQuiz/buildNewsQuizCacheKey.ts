import { fnv1aHash } from '@/libs/hash';
import { CreateNewsQuizInput, QUIZ_SCHEMA_VERSION } from '../types';
import { QuizSectionSpec } from './resolveIncludedSections';

export const QUIZ_GENERATION_CACHE_STORAGE = 'quiz-generation-cache-v1';

export const buildNewsQuizCacheKey = (
  input: CreateNewsQuizInput,
  sections: QuizSectionSpec[],
): string =>
  [
    'news-quiz',
    QUIZ_SCHEMA_VERSION,
    input.newsId,
    input.complexity,
    input.targetLanguageCode,
    input.nativeLanguageCode ?? '',
    input.imageUrl ? 'img' : 'no-img',
    sections.map((s) => s.type).join(','),
    fnv1aHash(input.content.slice(0, 12000)),
  ].join('|');
