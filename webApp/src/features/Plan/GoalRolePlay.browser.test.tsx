import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { GoalRolePlayIntroFixture } from './goalRolePlayBrowserFixtures';

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
