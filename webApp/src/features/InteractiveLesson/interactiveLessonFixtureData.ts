import { InteractiveLesson, LessonPartWithUserAnswer } from './types';

export const FIXTURE_READ_PART = {
  type: 'read' as const,
  contentMD: 'Use the past simple for finished actions. Example: I visited my friend yesterday.',
};

export const FIXTURE_SPEECH_PART = {
  type: 'speech' as const,
  contentMD: 'Say what you did yesterday in two sentences.',
};

export const FIXTURE_ANSWERED_SPEECH_PART: LessonPartWithUserAnswer = {
  type: 'speech',
  contentMD: 'Translate to English: Wczoraj spacerowałem w parku.',
  userVoiceTranscript: 'Yesterday I walked in the park.',
  aiResultToUser: 'Correct. Natural word order. You can also say "I went for a walk in the park."',
};

export const FIXTURE_LESSON: InteractiveLesson = {
  id: 'fixture-lesson',
  title: 'Past Simple',
  subTitle: 'Talk about yesterday',
  createdAtIso: '2026-08-29T10:00:00.000Z',
  completedAtIso: null,
  parts: [FIXTURE_READ_PART, FIXTURE_SPEECH_PART, FIXTURE_ANSWERED_SPEECH_PART],
  lessonResults: null,
};

export const FIXTURE_FINISHED_LESSON: InteractiveLesson = {
  ...FIXTURE_LESSON,
  id: 'fixture-finished',
  completedAtIso: '2026-08-29T11:00:00.000Z',
  lessonResults: {
    motivationTextToUserMD: 'You showed up and spoke in full sentences. That is the habit.',
    whatWentWellMD: 'Past verbs were clear. Next time add one time phrase like "in the evening".',
  },
};

export const noop = () => undefined;
export const noopAsync = async () => undefined;
