import { resolveIncludedSections } from './resolveIncludedSections';

describe('resolveIncludedSections', () => {
  it('includes all sections when native differs and image exists', () => {
    const sections = resolveIncludedSections({
      targetLanguageCode: 'en',
      nativeLanguageCode: 'pl',
      imageUrl: 'https://example.com/img.jpg',
      questionsPerType: 3,
    });
    expect(sections.map((s) => s.type)).toEqual([
      'word-translation',
      'fill-gap',
      'read-and-answer',
      'listening',
      'describe-picture-voice',
    ]);
    expect(sections.find((s) => s.type === 'describe-picture-voice')?.questionCount).toBe(1);
    expect(
      sections.filter((s) => s.type !== 'describe-picture-voice').every((s) => s.questionCount === 3),
    ).toBe(true);
  });

  it('omits word-translation when native matches target', () => {
    const sections = resolveIncludedSections({
      targetLanguageCode: 'en',
      nativeLanguageCode: 'en',
      imageUrl: null,
      questionsPerType: 3,
    });
    expect(sections.map((s) => s.type)).toEqual([
      'fill-gap',
      'read-and-answer',
      'listening',
    ]);
  });

  it('omits describe-picture when image is missing', () => {
    const sections = resolveIncludedSections({
      targetLanguageCode: 'en',
      nativeLanguageCode: 'pl',
      imageUrl: null,
      questionsPerType: 3,
    });
    expect(sections.some((s) => s.type === 'describe-picture-voice')).toBe(false);
  });
});
