import {
  applySpeechAnswer,
  discardCurrentLesson,
  emptyLessonStore,
  isLessonCompletedToday,
  isLessonFinished,
  isSameLocalDay,
  promoteFinishedLesson,
} from './lessonState';
import { InteractiveLesson } from './types';

const makeLesson = (overrides: Partial<InteractiveLesson> = {}): InteractiveLesson => ({
  id: 'lesson-1',
  title: 'Past Simple',
  subTitle: 'Talk about yesterday',
  createdAtIso: '2026-08-29T10:00:00.000Z',
  completedAtIso: null,
  parts: [
    { type: 'read', contentMD: 'Use past simple for finished actions.' },
    { type: 'speech', contentMD: 'Say what you did yesterday.' },
  ],
  lessonResults: null,
  ...overrides,
});

describe('lessonState', () => {
  it('detects the same local day', () => {
    const now = new Date('2026-08-29T18:00:00');
    expect(isSameLocalDay(now.toISOString(), now)).toBe(true);
    expect(isSameLocalDay('2026-08-28T18:00:00.000Z', now)).toBe(false);
  });

  it('marks the card done when a lesson was completed today', () => {
    const now = new Date('2026-08-29T18:00:00');
    const store = {
      ...emptyLessonStore(),
      lastCompletedAtIso: now.toISOString(),
    };
    expect(isLessonCompletedToday(store, now)).toBe(true);
    expect(isLessonCompletedToday(emptyLessonStore(), now)).toBe(false);
  });

  it('applies a spoken answer onto the matching part', () => {
    const updated = applySpeechAnswer(makeLesson(), 1, {
      userVoiceTranscript: 'I walked in the park.',
      aiResultToUser: 'Correct tense. Natural sentence.',
    });

    expect(updated.parts[1]).toMatchObject({
      type: 'speech',
      userVoiceTranscript: 'I walked in the park.',
      aiResultToUser: 'Correct tense. Natural sentence.',
    });
  });

  it('promotes a finished lesson into history and uses the next one', () => {
    const finished = makeLesson({
      lessonResults: {
        motivationTextToUserMD: 'Nice work.',
        whatWentWellMD: 'Clear past verbs.',
      },
      completedAtIso: '2026-08-29T11:00:00.000Z',
    });
    const next = makeLesson({ id: 'lesson-2', title: 'Questions' });

    const promoted = promoteFinishedLesson({
      ...emptyLessonStore(),
      currentLesson: finished,
      nextLesson: next,
      lastCompletedAtIso: finished.completedAtIso,
    });

    expect(isLessonFinished(finished)).toBe(true);
    expect(promoted.history[0]?.id).toBe('lesson-1');
    expect(promoted.currentLesson?.id).toBe('lesson-2');
    expect(promoted.nextLesson).toBeNull();
  });

  it('discards the current lesson without marking it done', () => {
    const current = makeLesson();
    const next = makeLesson({ id: 'lesson-2', title: 'Questions' });
    const discarded = discardCurrentLesson({
      ...emptyLessonStore(),
      currentLesson: current,
      nextLesson: next,
      lastCompletedAtIso: null,
    });
    expect(discarded.currentLesson).toBeNull();
    expect(discarded.nextLesson).toBeNull();
    expect(discarded.lastCompletedAtIso).toBeNull();
    expect(discarded.history).toEqual([]);
  });

  it('does not promote an unfinished lesson', () => {
    const current = makeLesson();
    const store = {
      ...emptyLessonStore(),
      currentLesson: current,
    };
    expect(promoteFinishedLesson(store)).toBe(store);
  });
});
