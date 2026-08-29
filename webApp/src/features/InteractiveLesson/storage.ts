import { emptyLessonStore } from './lessonState';
import { InteractiveLesson, InteractiveLessonStore, LessonPartState, LessonResults } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const parseLessonResults = (value: unknown): LessonResults | null => {
  if (!isRecord(value)) return null;
  if (
    typeof value.motivationTextToUserMD !== 'string' ||
    typeof value.whatWentWellMD !== 'string'
  ) {
    return null;
  }
  return {
    motivationTextToUserMD: value.motivationTextToUserMD,
    whatWentWellMD: value.whatWentWellMD,
  };
};

const parseLessonPart = (value: unknown): LessonPartState | null => {
  if (!isRecord(value)) return null;
  if (value.type !== 'read' && value.type !== 'speech') return null;
  if (typeof value.contentMD !== 'string') return null;

  const part: LessonPartState = {
    contentMD: value.contentMD,
    type: value.type,
  };

  if (typeof value.userVoiceTranscript === 'string' && typeof value.aiResultToUser === 'string') {
    return {
      ...part,
      userVoiceTranscript: value.userVoiceTranscript,
      aiResultToUser: value.aiResultToUser,
      ...(typeof value.userAudioUrl === 'string' ? { userAudioUrl: value.userAudioUrl } : {}),
    };
  }

  return part;
};

export const parseInteractiveLesson = (value: unknown): InteractiveLesson | null => {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.title !== 'string') return null;
  if (typeof value.subTitle !== 'string' || typeof value.createdAtIso !== 'string') return null;
  if (!Array.isArray(value.parts)) return null;

  const parts = value.parts.map(parseLessonPart).filter((part): part is LessonPartState => !!part);
  if (parts.length === 0) return null;

  return {
    id: value.id,
    title: value.title,
    subTitle: value.subTitle,
    createdAtIso: value.createdAtIso,
    completedAtIso: typeof value.completedAtIso === 'string' ? value.completedAtIso : null,
    parts,
    lessonResults: parseLessonResults(value.lessonResults),
  };
};

export const parseInteractiveLessonStore = (value: unknown): InteractiveLessonStore => {
  if (!isRecord(value)) return emptyLessonStore();

  const history = Array.isArray(value.history)
    ? value.history
        .map(parseInteractiveLesson)
        .filter((lesson): lesson is InteractiveLesson => !!lesson)
    : [];

  return {
    currentLesson: parseInteractiveLesson(value.currentLesson),
    nextLesson: parseInteractiveLesson(value.nextLesson),
    history,
    lastCompletedAtIso:
      typeof value.lastCompletedAtIso === 'string' ? value.lastCompletedAtIso : null,
  };
};
