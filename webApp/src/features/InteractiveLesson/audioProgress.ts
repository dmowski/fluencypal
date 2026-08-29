import { PROGRESS_AUDIO_SAMPLE, PROGRESS_MIN_AUDIO_COUNT } from './constants';
import {
  InteractiveLesson,
  isLessonPartWithAnswer,
  LessonAudioProgress,
  LessonAudioRecord,
} from './types';

export const emptyAudioProgress = (): LessonAudioProgress => ({
  first: [],
  last: [],
  totalCount: 0,
});

export const remainingAudiosForProgress = (totalCount: number): number => {
  return Math.max(0, PROGRESS_MIN_AUDIO_COUNT - totalCount);
};

export const canShowAudioProgress = (totalCount: number): boolean => {
  return remainingAudiosForProgress(totalCount) === 0;
};

export const recordLessonAudio = (
  progress: LessonAudioProgress,
  record: LessonAudioRecord,
): LessonAudioProgress => {
  const first =
    progress.first.length < PROGRESS_AUDIO_SAMPLE
      ? [...progress.first, record]
      : progress.first;
  const last = [...progress.last, record].slice(-PROGRESS_AUDIO_SAMPLE);
  return {
    first,
    last,
    totalCount: progress.totalCount + 1,
  };
};

export const collectLessonAudios = (lessons: InteractiveLesson[]): LessonAudioRecord[] => {
  return lessons.flatMap((lesson) =>
    lesson.parts.flatMap((part, index) => {
      if (!isLessonPartWithAnswer(part) || !part.userAudioUrl) return [];
      return [
        {
          id: `${lesson.id}-${index}`,
          audioUrl: part.userAudioUrl,
          transcript: part.userVoiceTranscript,
          recordedAtIso: lesson.completedAtIso || lesson.createdAtIso,
        },
      ];
    }),
  );
};

export const ensureAudioProgress = (
  stored: LessonAudioProgress | null,
  lessonsOldestFirst: InteractiveLesson[],
): LessonAudioProgress => {
  if (stored && stored.totalCount > 0) return stored;
  return collectLessonAudios(lessonsOldestFirst).reduce(
    (progress, record) => recordLessonAudio(progress, record),
    emptyAudioProgress(),
  );
};
