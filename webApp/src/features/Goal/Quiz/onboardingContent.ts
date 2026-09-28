type I18n = { _: (text: string) => string };

export const practiceReasonExamples = (i18n: I18n) => [
  i18n._(
    'I want to learn English so I can pass a job interview. I am a doctor, and I need to explain my experience and answer questions about my work.',
  ),
  i18n._(
    'I want to practice English to pass an exam. I need to speak and write clearly on the test, and I want to feel ready on the day.',
  ),
  i18n._(
    'I want to prepare for a trip to the USA. I need to order food, ask for directions, and talk with the people I meet there.',
  ),
  i18n._(
    'I want to talk with my friends from Canada. They are mostly musicians, and I want to follow their conversations and join in.',
  ),
  i18n._(
    'I want to find more English-speaking friends. I want to start a conversation and keep it going without switching back to my language.',
  ),
];

export const followUpSubtitle = (i18n: I18n) =>
  i18n._('This is an important step. Your answer is what we use to create your personal plan.');

export const personalizedPlanContext = (survey: {
  aboutUserTranscription?: string;
  aboutUserFollowUpTranscription?: string;
  wantsToTalkWithRealPeople?: boolean | null;
  comfortableActivities?: readonly string[];
}): string => {
  const parts = [
    (survey.aboutUserTranscription || '').trim(),
    (survey.aboutUserFollowUpTranscription || '').trim(),
  ].filter(Boolean);

  if (survey.wantsToTalkWithRealPeople === true) {
    parts.push('They want to talk with real people.');
  } else if (survey.wantsToTalkWithRealPeople === false) {
    parts.push('They do not want to talk with real people right now.');
  }

  if (survey.comfortableActivities?.length) {
    parts.push(`Comfortable activities: ${survey.comfortableActivities.join(', ')}.`);
  }

  return parts.join('\n');
};
