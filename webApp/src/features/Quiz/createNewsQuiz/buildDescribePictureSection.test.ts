import { buildDescribePictureSection, mergeDescribePictureSection } from './buildDescribePictureSection';

describe('buildDescribePictureSection', () => {
  it('creates exactly one speaking question', () => {
    const section = buildDescribePictureSection({
      imageDescription: 'A crowd at a city square.',
      targetLanguageCode: 'en',
    });
    expect(section.type).toBe('describe-picture-voice');
    expect(section.questions).toHaveLength(1);
    const question = section.questions[0];
    expect('evaluation' in question && question.evaluation.instruction).toContain(
      'crowd at a city square',
    );
  });

  it('replaces any AI-generated speaking section', () => {
    const draft = {
      meta: { title: 'Quiz' },
      sections: [
        {
          type: 'describe-picture-voice' as const,
          title: 'Old',
          questions: [
            {
              promptText: 'old',
              evaluation: { instruction: 'old' },
            },
            {
              promptText: 'old2',
              evaluation: { instruction: 'old2' },
            },
          ],
        },
        {
          type: 'fill-gap' as const,
          title: 'Grammar',
          questions: [
            {
              segments: [{ kind: 'text' as const, text: 'Hi' }],
              gaps: {
                g1: { options: [{ label: 'a', isCorrect: true }] },
              },
            },
          ],
        },
      ],
      examEvaluation: { instruction: 'sum' },
    };

    const pictureSection = buildDescribePictureSection({
      imageDescription: 'A rocket on a launch pad.',
      targetLanguageCode: 'en',
    });
    const merged = mergeDescribePictureSection(draft, pictureSection);
    expect(merged.sections).toHaveLength(2);
    expect(merged.sections[1].questions).toHaveLength(1);
  });
});
