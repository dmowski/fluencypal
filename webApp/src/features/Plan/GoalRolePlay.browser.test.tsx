import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import {
  GoalRolePlayIntroFixture,
  GoalRolePlayLessonFooterFixture,
} from './goalRolePlayBrowserFixtures';
import { GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES } from './goalRolePlayCompletion';

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    userInfo: { displayName: 'Test User' },
    getToken: async () => 'fixture-token',
  }),
}));

test('role-play intro – first attempt without skip', async () => {
  await render(<GoalRolePlayIntroFixture showSkipLesson={false} />);

  await expect
    .element(page.getByTestId('goal-role-play-intro-fixture-shell'))
    .toMatchScreenshot('role-play-intro-first-attempt');
});

test('role-play intro – skip available after repeated attempts', async () => {
  await render(<GoalRolePlayIntroFixture showSkipLesson={true} />);

  await expect
    .element(page.getByTestId('goal-role-play-intro-fixture-shell'))
    .toMatchScreenshot('role-play-intro-with-skip');
});

test('role-play footer – early finish hint in progress', async () => {
  await render(
    <GoalRolePlayLessonFooterFixture
      userMessageCount={2}
      canFinishLesson={false}
      showSkipLesson={false}
    />,
  );

  await expect
    .element(page.getByTestId('goal-role-play-footer-fixture-shell'))
    .toMatchScreenshot('role-play-footer-early-hint');
});

test('role-play footer – finish available after enough messages', async () => {
  await render(
    <GoalRolePlayLessonFooterFixture
      userMessageCount={GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES}
      canFinishLesson={true}
    />,
  );

  await expect
    .element(page.getByTestId('goal-role-play-footer-fixture-shell'))
    .toMatchScreenshot('role-play-footer-finish-ready');
});

test('role-play footer – skip during lesson after repeated attempts', async () => {
  await render(
    <GoalRolePlayLessonFooterFixture
      userMessageCount={1}
      canFinishLesson={false}
      showSkipLesson={true}
    />,
  );

  await expect
    .element(page.getByTestId('goal-role-play-footer-fixture-shell'))
    .toMatchScreenshot('role-play-footer-with-skip');
});
