import { emptyLessonStore } from './lessonState';
import { parseInteractiveLesson, parseInteractiveLessonStore } from './storage';

describe('interactive lesson storage', () => {
  it('parses a valid lesson and drops broken parts', () => {
    const lesson = parseInteractiveLesson({
      id: 'abc',
      title: 'Articles',
      subTitle: 'A vs the',
      createdAtIso: '2026-08-29T10:00:00.000Z',
      completedAtIso: null,
      lessonResults: null,
      parts: [
        { type: 'read', contentMD: 'Use a before a new noun.' },
        { type: 'nope', contentMD: 'bad' },
        {
          type: 'speech',
          contentMD: 'Describe your room.',
          userVoiceTranscript: 'It is small.',
          aiResultToUser: 'Good.',
          userAudioUrl: 'https://example.com/voice.webm',
        },
      ],
    });

    expect(lesson?.parts).toHaveLength(2);
    expect(lesson?.parts[1]).toMatchObject({
      type: 'speech',
      userVoiceTranscript: 'It is small.',
      userAudioUrl: 'https://example.com/voice.webm',
    });
  });

  it('returns an empty store for invalid payloads', () => {
    expect(parseInteractiveLessonStore(null)).toEqual(emptyLessonStore());
    expect(parseInteractiveLessonStore({ currentLesson: { title: 'x' } })).toEqual({
      ...emptyLessonStore(),
      currentLesson: null,
    });
  });
});
