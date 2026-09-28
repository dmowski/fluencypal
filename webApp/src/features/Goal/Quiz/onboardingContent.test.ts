import { personalizedPlanContext, practiceReasonExamples } from './onboardingContent';

const identityI18n = { _: (text: string) => text };

describe('practiceReasonExamples', () => {
  it('lists the most common reasons first, as full sentences', () => {
    const examples = practiceReasonExamples(identityI18n);
    expect(examples).toHaveLength(5);
    expect(examples[0]).toContain('job interview');
    expect(examples[1]).toContain('exam');
    expect(examples[2]).toContain('USA');
    expect(examples[3]).toContain('Canada');
    expect(examples[4]).toContain('English-speaking friends');
  });
});

describe('personalizedPlanContext', () => {
  it('includes both answers and the choices that shape the plan', () => {
    expect(
      personalizedPlanContext({
        aboutUserTranscription: 'I want to pass an exam.',
        aboutUserFollowUpTranscription: 'It is IELTS in June.',
        wantsToTalkWithRealPeople: false,
        comfortableActivities: ['read', 'quiz'],
      }),
    ).toBe(
      [
        'I want to pass an exam.',
        'It is IELTS in June.',
        'They do not want to talk with real people right now.',
        'Comfortable activities: read, quiz.',
      ].join('\n'),
    );
  });
});
