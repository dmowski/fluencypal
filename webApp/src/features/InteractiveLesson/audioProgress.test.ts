import {
  canShowAudioProgress,
  collectLessonAudios,
  emptyAudioProgress,
  ensureAudioProgress,
  recordLessonAudio,
  remainingAudiosForProgress,
} from './audioProgress';
import { InteractiveLesson } from './types';

const makeRecord = (index: number) => ({
  id: `audio-${index}`,
  audioUrl: `/api/uploadFile?path=audio-${index}`,
  transcript: `Answer ${index}`,
  recordedAtIso: '2026-08-29T10:00:00.000Z',
});

describe('audioProgress', () => {
  it('keeps the first 10 and a rolling last 10', () => {
    const progress = Array.from({ length: 15 }, (_, index) => makeRecord(index)).reduce(
      recordLessonAudio,
      emptyAudioProgress(),
    );

    expect(progress.totalCount).toBe(15);
    expect(progress.first.map((record) => record.id)).toEqual(
      Array.from({ length: 10 }, (_, index) => `audio-${index}`),
    );
    expect(progress.last.map((record) => record.id)).toEqual(
      Array.from({ length: 10 }, (_, index) => `audio-${index + 5}`),
    );
  });

  it('unlocks comparison when the last 10 sit 100 recordings after the first 10', () => {
    expect(canShowAudioProgress(109)).toBe(false);
    expect(remainingAudiosForProgress(109)).toBe(1);
    expect(canShowAudioProgress(110)).toBe(true);
    expect(remainingAudiosForProgress(110)).toBe(0);
  });

  it('backfills from existing lessons when progress was never stored', () => {
    const lesson: InteractiveLesson = {
      id: 'lesson-1',
      title: 'Past Simple',
      subTitle: 'Talk about yesterday',
      createdAtIso: '2026-08-29T10:00:00.000Z',
      completedAtIso: '2026-08-29T11:00:00.000Z',
      parts: [
        {
          type: 'speech',
          contentMD: 'Say what you did.',
          userVoiceTranscript: 'I walked.',
          aiResultToUser: 'Good.',
          userAudioUrl: '/api/uploadFile?path=old',
        },
      ],
      lessonResults: null,
    };

    expect(collectLessonAudios([lesson])).toHaveLength(1);
    const backfilled = ensureAudioProgress(null, [lesson]);
    expect(backfilled.totalCount).toBe(1);
    expect(backfilled.first[0]?.audioUrl).toBe('/api/uploadFile?path=old');
  });
});
