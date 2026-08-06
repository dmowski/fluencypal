import {
  canFinishGoalRolePlayLesson,
  canSkipGoalRolePlayLesson,
  countUserMessages,
  GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES,
  shouldRegenerateGoalRolePlayPlan,
} from './goalRolePlayCompletion';

describe('goalRolePlayCompletion', () => {
  it('counts only user messages', () => {
    expect(
      countUserMessages([
        { isBot: true },
        { isBot: false },
        { isBot: false },
        { isBot: true },
      ]),
    ).toBe(2);
  });

  it('allows early finish for goal-role-play after 4 user messages', () => {
    expect(
      canFinishGoalRolePlayLesson({
        currentMode: 'goal-role-play',
        userMessageCount: GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES - 1,
        lessonProgress: 20,
      }),
    ).toBe(false);

    expect(
      canFinishGoalRolePlayLesson({
        currentMode: 'goal-role-play',
        userMessageCount: GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES,
        lessonProgress: 20,
      }),
    ).toBe(true);
  });

  it('still requires full progress for non role-play modes', () => {
    expect(
      canFinishGoalRolePlayLesson({
        currentMode: 'goal-talk',
        userMessageCount: 10,
        lessonProgress: 80,
      }),
    ).toBe(false);

    expect(
      canFinishGoalRolePlayLesson({
        currentMode: 'goal-talk',
        userMessageCount: 10,
        lessonProgress: 100,
      }),
    ).toBe(true);
  });

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
