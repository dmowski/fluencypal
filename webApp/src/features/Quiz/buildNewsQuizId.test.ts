import { buildNewsQuizId, parseNewsQuizId } from './buildNewsQuizId';

describe('buildNewsQuizId', () => {
  it('builds deterministic id from news inputs', () => {
    expect(buildNewsQuizId('article-1', 'middle', 'en')).toBe('news_article-1_middle_en');
  });

  it('parses a news quiz id', () => {
    expect(parseNewsQuizId('news_article-1_middle_en')).toEqual({
      newsId: 'article-1',
      complexity: 'middle',
      targetLanguageCode: 'en',
    });
  });

  it('returns null for non-news ids', () => {
    expect(parseNewsQuizId('manual_quiz')).toBeNull();
  });
});
