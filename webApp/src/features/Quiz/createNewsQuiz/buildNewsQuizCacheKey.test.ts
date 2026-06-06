import { buildNewsQuizCacheKey } from './buildNewsQuizCacheKey';

describe('buildNewsQuizCacheKey', () => {
  it('is stable for the same inputs', () => {
    const input = {
      newsId: 'abc',
      title: 'Title',
      content: 'Article body',
      complexity: 'middle' as const,
      targetLanguageCode: 'en' as const,
      nativeLanguageCode: 'pl' as const,
      imageUrl: 'https://example.com/img.jpg',
    };
    const sections = [
      { type: 'fill-gap' as const, title: 'Grammar', questionCount: 3 },
    ];

    const a = buildNewsQuizCacheKey(input, sections);
    const b = buildNewsQuizCacheKey(input, sections);
    expect(a).toBe(b);
  });

  it('changes when content changes', () => {
    const base = {
      newsId: 'abc',
      title: 'Title',
      complexity: 'middle' as const,
      targetLanguageCode: 'en' as const,
      nativeLanguageCode: null,
      imageUrl: null,
    };
    const sections = [{ type: 'read-and-answer' as const, title: 'Reading', questionCount: 3 }];

    const a = buildNewsQuizCacheKey({ ...base, content: 'version a' }, sections);
    const b = buildNewsQuizCacheKey({ ...base, content: 'version b' }, sections);
    expect(a).not.toBe(b);
  });
});
