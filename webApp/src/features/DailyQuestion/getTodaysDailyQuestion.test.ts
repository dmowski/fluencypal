import { dailyQuestions } from './dailyQuestions';
import {
  getDailyQuestionSelection,
  getTodaysDailyQuestion,
  getUtcDayIndex,
} from './getTodaysDailyQuestion';

const QUESTION_COUNT = Object.keys(dailyQuestions).length;

describe('getTodaysDailyQuestion', () => {
  it('returns the same question for every timestamp in the same UTC day', () => {
    const startOfDay = getTodaysDailyQuestion(new Date('2026-08-26T00:00:00.000Z'));
    const midday = getTodaysDailyQuestion(new Date('2026-08-26T12:00:00.000Z'));
    const endOfDay = getTodaysDailyQuestion(new Date('2026-08-26T23:59:59.999Z'));

    expect(startOfDay.id).toBe(midday.id);
    expect(midday.id).toBe(endOfDay.id);
  });

  it('returns the same question regardless of how many times it is called (no per-user state)', () => {
    const now = new Date('2026-08-26T15:00:00.000Z');
    const firstUser = getTodaysDailyQuestion(now);
    const secondUser = getTodaysDailyQuestion(now);

    expect(firstUser.id).toBe(secondUser.id);
    expect(firstUser).toBe(secondUser);
  });

  it('does not take a user id or other per-user input', () => {
    expect(getTodaysDailyQuestion.length).toBeLessThanOrEqual(1);
  });

  it('advances to a different question on the next UTC day', () => {
    const today = getTodaysDailyQuestion(new Date('2026-08-26T12:00:00.000Z'));
    const tomorrow = getTodaysDailyQuestion(new Date('2026-08-27T12:00:00.000Z'));

    expect(tomorrow.id).not.toBe(today.id);
  });

  it('uses UTC so a late US evening and a European morning still share one question', () => {
    // Same instant for a user in US Pacific (still Aug 25 locally) and UTC (Aug 26).
    const usPacificEvening = new Date('2026-08-26T03:00:00.000Z');
    const utcMorning = new Date('2026-08-26T08:00:00.000Z');

    expect(getTodaysDailyQuestion(usPacificEvening).id).toBe(getTodaysDailyQuestion(utcMorning).id);
  });

  it('keeps previous questions distinct from today and in a stable shared order', () => {
    const now = new Date('2026-08-26T12:00:00.000Z');
    const { todaysQuestion, otherQuestions } = getDailyQuestionSelection(now);

    expect(otherQuestions).toHaveLength(QUESTION_COUNT - 1);
    expect(otherQuestions.map((question) => question.id)).not.toContain(todaysQuestion.id);
    expect(new Set(otherQuestions.map((question) => question.id)).size).toBe(QUESTION_COUNT - 1);
  });
});

describe('getUtcDayIndex', () => {
  it('is identical for any clock time on the same UTC day', () => {
    const count = 17;
    const index = getUtcDayIndex(new Date('2026-01-15T00:00:00.000Z'), count);

    expect(getUtcDayIndex(new Date('2026-01-15T12:34:56.000Z'), count)).toBe(index);
    expect(getUtcDayIndex(new Date('2026-01-15T23:59:59.999Z'), count)).toBe(index);
  });

  it('increments by one each UTC day and wraps around the catalog', () => {
    const count = 7;
    const day0 = getUtcDayIndex(new Date('2025-01-01T00:00:00.000Z'), count);
    const day1 = getUtcDayIndex(new Date('2025-01-02T00:00:00.000Z'), count);
    const day7 = getUtcDayIndex(new Date('2025-01-08T00:00:00.000Z'), count);

    expect(day0).toBe(0);
    expect(day1).toBe(1);
    expect(day7).toBe(0);
  });
});
