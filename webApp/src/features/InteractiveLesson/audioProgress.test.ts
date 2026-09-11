import {
  canShowAudioProgress,
  collectLessonAudios,
  emptyAudioProgress,
  ensureAudioProgress,
  recordLessonAudio,
  recordOpenTalkAudio,
  remainingAudiosForProgress,
} from './audioProgress';
import { InteractiveLesson, LessonPartState } from './types';

const makeRecord = (index: number) => ({
  id: `audio-${index}`,
  audioUrl: `/api/uploadFile?path=audio-${index}`,
  transcript: `Answer ${index}`,
  recordedAtIso: '2026-08-29T10:00:00.000Z',
});

const makeAnsweredSpeech = (
  contentMD: string,
  transcript: string,
  audioPath: string,
): LessonPartState => ({
  type: 'speech',
  contentMD,
  userVoiceTranscript: transcript,
  aiResultToUser: 'Good.',
  userAudioUrl: `/api/uploadFile?path=${audioPath}`,
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

  it('unlocks comparison after 100 open talks', () => {
    expect(canShowAudioProgress(99)).toBe(false);
    expect(remainingAudiosForProgress(99)).toBe(1);
    expect(canShowAudioProgress(100)).toBe(true);
    expect(remainingAudiosForProgress(100)).toBe(0);
  });

  it('records only the last open-talk part, not read-aloud or short answers', () => {
    const parts: LessonPartState[] = [
      { type: 'read', contentMD: 'How to use the past simple.' },
      makeAnsweredSpeech('Read this text aloud.', 'I read it.', 'read-aloud'),
      makeAnsweredSpeech('Say what you did yesterday.', 'I walked.', 'short'),
      makeAnsweredSpeech('Talk for two minutes.', 'Yesterday I walked to the park.', 'open-talk'),
    ];

    const afterReadAloud = recordOpenTalkAudio(emptyAudioProgress(), parts, 1, makeRecord(1));
    const afterShort = recordOpenTalkAudio(afterReadAloud, parts, 2, makeRecord(2));
    const afterOpenTalk = recordOpenTalkAudio(afterShort, parts, 3, makeRecord(3));

    expect(afterReadAloud.totalCount).toBe(0);
    expect(afterShort.totalCount).toBe(0);
    expect(afterOpenTalk.totalCount).toBe(1);
    expect(afterOpenTalk.first[0]?.id).toBe('audio-3');
  });

  it('backfills only open talks from existing lessons', () => {
    const lesson: InteractiveLesson = {
      id: 'lesson-1',
      title: 'Past Simple',
      subTitle: 'Talk about yesterday',
      createdAtIso: '2026-08-29T10:00:00.000Z',
      completedAtIso: '2026-08-29T11:00:00.000Z',
      parts: [
        { type: 'read', contentMD: 'How to use the past simple.' },
        makeAnsweredSpeech('Read this text aloud.', 'I read it.', 'read-aloud'),
        makeAnsweredSpeech('Say what you did yesterday.', 'I walked.', 'short'),
        makeAnsweredSpeech('Talk for two minutes.', 'Yesterday I walked to the park.', 'open-talk'),
      ],
      lessonResults: null,
    };

    expect(collectLessonAudios([lesson])).toEqual([
      {
        id: 'lesson-1-3',
        audioUrl: '/api/uploadFile?path=open-talk',
        transcript: 'Yesterday I walked to the park.',
        recordedAtIso: '2026-08-29T11:00:00.000Z',
      },
    ]);
    const backfilled = ensureAudioProgress(null, [lesson]);
    expect(backfilled.totalCount).toBe(1);
    expect(backfilled.first[0]?.audioUrl).toBe('/api/uploadFile?path=open-talk');
    expect(backfilled.openTalkOnly).toBe(true);
  });

  it('rebuilds mixed stored progress that is not open-talk-only', () => {
    const lesson: InteractiveLesson = {
      id: 'lesson-1',
      title: 'Past Simple',
      subTitle: 'Talk about yesterday',
      createdAtIso: '2026-08-29T10:00:00.000Z',
      completedAtIso: '2026-08-29T11:00:00.000Z',
      parts: [
        { type: 'read', contentMD: 'How to use the past simple.' },
        makeAnsweredSpeech('Read this text aloud.', 'I read it.', 'read-aloud'),
        makeAnsweredSpeech('Talk for two minutes.', 'Yesterday I walked to the park.', 'open-talk'),
      ],
      lessonResults: null,
    };

    const rebuilt = ensureAudioProgress(
      {
        first: [makeRecord(0), makeRecord(1)],
        last: [makeRecord(0), makeRecord(1)],
        totalCount: 2,
      },
      [lesson],
    );

    expect(rebuilt.totalCount).toBe(1);
    expect(rebuilt.first[0]?.audioUrl).toBe('/api/uploadFile?path=open-talk');
    expect(rebuilt.openTalkOnly).toBe(true);
  });
});
