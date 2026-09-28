import {
  followUpKindFromTranscript,
  followUpTitleForKind,
  personalizedPlanContext,
  practiceReasonExamples,
} from './onboardingContent';

const identityI18n = { _: (text: string) => text };

describe('followUpKindFromTranscript', () => {
  it('picks a follow-up from the most common reasons', () => {
    expect(followUpKindFromTranscript('I want to pass a job interview. I am a doctor.')).toBe(
      'interview',
    );
    expect(followUpKindFromTranscript('I need to pass the IELTS exam')).toBe('exam');
    expect(followUpKindFromTranscript('I am preparing for a trip to the USA')).toBe('travel');
    expect(followUpKindFromTranscript('My friends in Canada are musicians')).toBe('friends');
    expect(followUpKindFromTranscript('I just want to feel more confident')).toBe('general');
  });
});

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

describe('followUpTitleForKind', () => {
  it('asks one plan question for the detected reason', () => {
    expect(followUpTitleForKind('interview', identityI18n)).toContain('interview');
    expect(followUpTitleForKind('general', identityI18n)).toContain('English');
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
