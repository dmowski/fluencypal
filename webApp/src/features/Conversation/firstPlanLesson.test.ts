import { GoalPlan } from '@/features/Plan/types';
import {
  isFirstPlanLessonLocked,
  isFirstPlanLessonUsed,
  nextPlanLessonCard,
} from './firstPlanLesson';

const goal = (progress: GoalPlan['progress'] = []): GoalPlan =>
  ({
    id: 'g1',
    title: 'Work calls',
    languageCode: 'en',
    createdAt: 1,
    updatedAt: 2,
    elements: [
      {
        id: 'e1',
        title: 'Clients',
        subTitle: 'First calls',
        mode: 'conversation',
        description: 'Talk with clients',
        details: 'Practice a short client call.',
        startCount: 0,
      },
      {
        id: 'e2',
        title: 'Greetings',
        subTitle: 'Small talk',
        mode: 'words',
        description: 'Casual greetings',
        details: 'Words for saying hello.',
        startCount: 0,
      },
    ],
    progress,
  }) as GoalPlan;

describe('firstPlanLesson', () => {
  it('locks another call only after the first lesson is used and they have no access', () => {
    expect(isFirstPlanLessonUsed(goal())).toBe(false);
    expect(isFirstPlanLessonLocked(goal(), false)).toBe(false);
    const used = goal([
      {
        elementId: 'e1',
        state: 'in_progress',
        startedAtIso: '2026-09-26T00:00:00Z',
        completedAtIso: null,
        results: null,
      },
    ]);
    expect(isFirstPlanLessonUsed(used)).toBe(true);
    expect(isFirstPlanLessonLocked(used, false)).toBe(true);
    expect(isFirstPlanLessonLocked(used, true)).toBe(false);
  });

  it('offers the second plan card after lesson 1', () => {
    expect(nextPlanLessonCard(goal())).toEqual({
      title: 'Greetings',
      details: 'Words for saying hello.',
    });
    expect(nextPlanLessonCard(null)).toBeNull();
  });
});
