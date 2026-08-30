import { emptyLessonStore } from './lessonState';
import { countLessonsCompletedSince } from './countLessonsCompletedSince';
import { InteractiveLesson, InteractiveLessonStore } from './types';

const makeLesson = (overrides: Partial<InteractiveLesson> = {}): InteractiveLesson => ({
  id: 'lesson-1',
  title: 'Past Simple',
  subTitle: 'Talk about yesterday',
  createdAtIso: '2026-08-29T10:00:00.000Z',
  completedAtIso: '2026-08-30T10:00:00.000Z',
  parts: [{ type: 'read', contentMD: 'Rule' }],
  lessonResults: { motivationTextToUserMD: 'Nice', whatWentWellMD: 'Clear' },
  ...overrides,
});

const makeStore = (overrides: Partial<InteractiveLessonStore> = {}): InteractiveLessonStore => ({
  ...emptyLessonStore(),
  ...overrides,
});

describe('countLessonsCompletedSince', () => {
  const now = new Date('2026-08-30T12:00:00.000Z');

  it('counts finished lessons inside the 24-hour window', () => {
    const stores = [
      makeStore({
        currentLesson: makeLesson({
          id: 'current',
          completedAtIso: '2026-08-30T11:00:00.000Z',
        }),
        history: [
          makeLesson({ id: 'recent', completedAtIso: '2026-08-29T12:30:00.000Z' }),
          makeLesson({ id: 'old', completedAtIso: '2026-08-28T10:00:00.000Z' }),
        ],
      }),
    ];

    expect(countLessonsCompletedSince(stores, now)).toBe(2);
  });

  it('does not count unfinished lessons or duplicate ids', () => {
    const finished = makeLesson({
      id: 'same',
      completedAtIso: '2026-08-30T11:00:00.000Z',
    });
    const stores = [
      makeStore({
        currentLesson: finished,
        history: [finished, makeLesson({ id: 'open', completedAtIso: null, lessonResults: null })],
      }),
    ];

    expect(countLessonsCompletedSince(stores, now)).toBe(1);
  });
});
