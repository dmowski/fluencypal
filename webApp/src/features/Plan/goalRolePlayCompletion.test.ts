import {
  canSkipGoalRolePlayLesson,
  shouldRegenerateGoalRolePlayPlan,
} from './goalRolePlayCompletion';

describe('goalRolePlayCompletion', () => {
  it('regenerates plan on retry for play elements', () => {
    expect(shouldRegenerateGoalRolePlayPlan('play', 1)).toBe(false);
    expect(shouldRegenerateGoalRolePlayPlan('play', 2)).toBe(true);
    expect(shouldRegenerateGoalRolePlayPlan('conversation', 5)).toBe(false);
  });

  it('offers skip after three starts on play elements', () => {
    expect(
      canSkipGoalRolePlayLesson({
        mode: 'play',
        startCount: 2,
        isCompleted: false,
      }),
    ).toBe(false);

    expect(
      canSkipGoalRolePlayLesson({
        mode: 'play',
        startCount: 3,
        isCompleted: false,
      }),
    ).toBe(true);

    expect(
      canSkipGoalRolePlayLesson({
        mode: 'play',
        startCount: 5,
        isCompleted: true,
      }),
    ).toBe(false);
  });
});
