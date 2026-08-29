import { ensureAudioProgress } from './audioProgress';
import { emptyLessonStore } from './lessonState';
import {
  InteractiveLesson,
  InteractiveLessonStore,
  LessonAudioProgress,
  LessonAudioRecord,
  LessonPartState,
  LessonResults,
} from './types';

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

const parseAudioRecord = (value: unknown): LessonAudioRecord | null => {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.audioUrl !== 'string') return null;
  if (typeof value.transcript !== 'string' || typeof value.recordedAtIso !== 'string') return null;
  return {
    id: value.id,
    audioUrl: value.audioUrl,
    transcript: value.transcript,
    recordedAtIso: value.recordedAtIso,
  };
};

const parseAudioProgress = (value: unknown): LessonAudioProgress | null => {
  if (!isRecord(value)) return null;
  if (typeof value.totalCount !== 'number' || value.totalCount < 0) return null;
  if (!Array.isArray(value.first) || !Array.isArray(value.last)) return null;
  const first = value.first.map(parseAudioRecord).filter((record): record is LessonAudioRecord => !!record);
  const last = value.last.map(parseAudioRecord).filter((record): record is LessonAudioRecord => !!record);
  return { first, last, totalCount: value.totalCount };
};

export const parseInteractiveLessonStore = (value: unknown): InteractiveLessonStore => {
  if (!isRecord(value)) return emptyLessonStore();

  const history = Array.isArray(value.history)
    ? value.history
        .map(parseInteractiveLesson)
        .filter((lesson): lesson is InteractiveLesson => !!lesson)
    : [];

  const currentLesson = parseInteractiveLesson(value.currentLesson);
  const nextLesson = parseInteractiveLesson(value.nextLesson);
  const oldestFirst = [...history].reverse().concat(currentLesson || [], nextLesson || []);

  return {
    currentLesson,
    nextLesson,
    history,
    lastCompletedAtIso:
      typeof value.lastCompletedAtIso === 'string' ? value.lastCompletedAtIso : null,
    audioProgress: ensureAudioProgress(parseAudioProgress(value.audioProgress), oldestFirst),
  };
};
