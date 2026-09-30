import { dailyQuestionImageUrls, getDailyQuestionImage } from './data';
import {
  canDeleteUserDailyQuestion,
  canEditUserDailyQuestion,
  splitUserDailyQuestions,
  toCommunityDailyQuestion,
  userDailyQuestionDayKey,
  userDailyQuestionId,
} from './userDailyQuestion';
import { UserDailyQuestion } from './types';

const question = (patch: Partial<UserDailyQuestion>): UserDailyQuestion => ({
  id: 'user_2026-10-01',
  authorUserId: 'user-1',
  title: 'What is a small habit you admire?',
  description: 'Name one habit and why it matters.',
  dayKey: '2026-10-01',
  imageUrl: dailyQuestionImageUrls[0],
  createdAtIso: '2026-10-01T12:00:00.000Z',
  updatedAtIso: '2026-10-01T12:00:00.000Z',
  ...patch,
});

describe('user daily questions', () => {
  it('uses the UTC day and one id per author per day', () => {
    const now = new Date('2026-10-01T23:30:00.000Z');
    expect(userDailyQuestionDayKey(now)).toBe('2026-10-01');
    expect(userDailyQuestionId('user-1', '2026-10-01')).toBe('user-1_2026-10-01');
  });

  it('puts today first and keeps older learner questions after, newest first', () => {
    const split = splitUserDailyQuestions(
      [
        question({ id: 'old', dayKey: '2026-09-30', createdAtIso: '2026-09-30T08:00:00.000Z' }),
        question({ id: 'older', dayKey: '2026-09-29', createdAtIso: '2026-09-29T08:00:00.000Z' }),
        question({ id: 'today-late', dayKey: '2026-10-01', createdAtIso: '2026-10-01T18:00:00.000Z' }),
        question({ id: 'today-early', dayKey: '2026-10-01', createdAtIso: '2026-10-01T01:00:00.000Z' }),
      ],
      new Date('2026-10-01T20:00:00.000Z'),
    );

    expect(split.todays.map((item) => item.id)).toEqual(['today-late', 'today-early']);
    expect(split.previous.map((item) => item.id)).toEqual(['old', 'older']);
  });

  it('uses the image they picked on the card', () => {
    const picked = dailyQuestionImageUrls[3];
    expect(getDailyQuestionImage(toCommunityDailyQuestion(question({ imageUrl: picked })))).toBe(
      picked,
    );
  });

  it('lets the author delete their question and the founder edit or delete any', () => {
    const mine = question({});
    expect(canDeleteUserDailyQuestion(mine, 'user-1', false)).toBe(true);
    expect(canDeleteUserDailyQuestion(mine, 'user-2', false)).toBe(false);
    expect(canDeleteUserDailyQuestion(mine, 'user-2', true)).toBe(true);
    expect(canEditUserDailyQuestion(false)).toBe(false);
    expect(canEditUserDailyQuestion(true)).toBe(true);
  });
});
