import { emptyAudioProgress } from './audioProgress';
import { MAX_HISTORY_LESSONS } from './constants';
import {
  InteractiveLesson,
  InteractiveLessonStore,
  isLessonPartWithAnswer,
  LessonPartState,
  LessonPartWithUserAnswer,
  LessonResults,
} from './types';

export const emptyLessonStore = (): InteractiveLessonStore => ({
  currentLesson: null,
  nextLesson: null,
  history: [],
  lastCompletedAtIso: null,
  audioProgress: emptyAudioProgress(),
});

export const isSameLocalDay = (iso: string, now = new Date()): boolean => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const isLessonCompletedToday = (
  store: InteractiveLessonStore,
  now = new Date(),
): boolean => {
  if (store.lastCompletedAtIso && isSameLocalDay(store.lastCompletedAtIso, now)) {
    return true;
  }
  if (store.currentLesson?.completedAtIso && isSameLocalDay(store.currentLesson.completedAtIso, now)) {
    return true;
  }
  return store.history.some(
    (lesson) => lesson.completedAtIso && isSameLocalDay(lesson.completedAtIso, now),
  );
};

export const isLessonFinished = (lesson: InteractiveLesson | null): boolean => {
  return !!lesson?.lessonResults;
};

export const applySpeechAnswer = (
  lesson: InteractiveLesson,
  partIndex: number,
  answer: Pick<LessonPartWithUserAnswer, 'userVoiceTranscript' | 'aiResultToUser' | 'userAudioUrl'>,
): InteractiveLesson => {
  const parts = lesson.parts.map((part, index) => {
    if (index !== partIndex) return part;
    return {
      ...part,
      userVoiceTranscript: answer.userVoiceTranscript,
      aiResultToUser: answer.aiResultToUser,
      ...(answer.userAudioUrl ? { userAudioUrl: answer.userAudioUrl } : {}),
    };
  });
  return { ...lesson, parts };
};

export const applyLessonResults = (
  lesson: InteractiveLesson,
  lessonResults: LessonResults,
  completedAtIso: string,
): InteractiveLesson => {
  return {
    ...lesson,
    lessonResults,
    completedAtIso,
  };
};

export const discardCurrentLesson = (store: InteractiveLessonStore): InteractiveLessonStore => {
  if (!store.currentLesson) return store;
  return {
    ...store,
    currentLesson: null,
    nextLesson: null,
  };
};

export const promoteFinishedLesson = (store: InteractiveLessonStore): InteractiveLessonStore => {
  const current = store.currentLesson;
  if (!current?.lessonResults) return store;

  return {
    ...store,
    history: [current, ...store.history].slice(0, MAX_HISTORY_LESSONS),
    currentLesson: store.nextLesson,
    nextLesson: null,
  };
};

export const listRecentLessonForms = (
  lessons: Array<Pick<InteractiveLesson, 'title' | 'subTitle'>>,
  limit = 10,
): string => {
  const seen = new Set<string>();
  return lessons
    .filter((lesson) => {
      const key = `${lesson.title}\0${lesson.subTitle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map((lesson) => `- ${lesson.title} — ${lesson.subTitle}`)
    .join('\n');
};

export const summarizeOpenTalks = (lessons: InteractiveLesson[], limit = 5): string => {
  return lessons
    .map((lesson) => {
      const lastPart = lesson.parts[lesson.parts.length - 1];
      if (!lastPart || lastPart.type !== 'speech' || !isLessonPartWithAnswer(lastPart)) {
        return '';
      }
      if (lastPart.userVoiceTranscript.trim().length < 40) return '';
      return [
        `Lesson: ${lesson.title}`,
        `Prompt: ${lastPart.contentMD}`,
        `Open talk:\n${lastPart.userVoiceTranscript}`,
      ].join('\n');
    })
    .filter(Boolean)
    .slice(0, limit)
    .join('\n\n---\n\n');
};

export const summarizeFinishedLessons = (lessons: InteractiveLesson[], limit = 5): string => {
  return lessons
    .filter((lesson) => lesson.lessonResults)
    .slice(0, limit)
    .map((lesson) => {
      const answered = lesson.parts
        .filter(isLessonPartWithAnswer)
        .map((part) => `- Prompt: ${part.contentMD}\n  Answer: ${part.userVoiceTranscript}\n  Feedback: ${part.aiResultToUser}`)
        .join('\n');
      return [
        `Title: ${lesson.title}`,
        `Subtitle: ${lesson.subTitle}`,
        lesson.lessonResults
          ? `Motivation: ${lesson.lessonResults.motivationTextToUserMD}\nWhat went well: ${lesson.lessonResults.whatWentWellMD}`
          : '',
        answered,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n---\n\n');
};

export const formatLessonAnswersForAi = (parts: LessonPartState[]): string => {
  return parts
    .map((part, index) => {
      const answer = isLessonPartWithAnswer(part)
        ? `Learner said: ${part.userVoiceTranscript}\nFeedback given: ${part.aiResultToUser}`
        : 'No spoken answer yet.';
      return `Part ${index + 1} (${part.type}):\n${part.contentMD}\n${answer}`;
    })
    .join('\n\n');
};
