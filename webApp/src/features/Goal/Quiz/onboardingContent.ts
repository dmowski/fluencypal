type I18n = { _: (text: string) => string };

export type PracticeFollowUpKind = 'interview' | 'exam' | 'travel' | 'friends' | 'general';

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

export const followUpTitleForKind = (kind: PracticeFollowUpKind, i18n: I18n) => {
  if (kind === 'interview') {
    return i18n._('What work do you do, and what do you need to say in that interview?');
  }
  if (kind === 'exam') {
    return i18n._('Which exam is it, and when do you need to be ready?');
  }
  if (kind === 'travel') {
    return i18n._('Where are you going, and what do you want to handle there in English?');
  }
  if (kind === 'friends') {
    return i18n._('Who do you want to talk with, and what do you usually talk about?');
  }
  return i18n._('What would change for you if you could do this in English?');
};

export const followUpSubtitle = (i18n: I18n) =>
  i18n._('This is an important step. Your answer is what we use to create your personal plan.');

/**
 * Career and exams are the most common reasons adults give for learning English,
 * then travel, then talking with people they already know, then making new friends.
 */
export const followUpKindFromTranscript = (transcript: string): PracticeFollowUpKind => {
  const text = transcript.toLowerCase();
  if (/interview|job|doctor|career|work/.test(text)) return 'interview';
  if (/exam|ielts|toefl|test/.test(text)) return 'exam';
  if (/trip|travel|usa|united states|visit/.test(text)) return 'travel';
  if (/friend|canada|musician|music/.test(text)) return 'friends';
  return 'general';
};

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
