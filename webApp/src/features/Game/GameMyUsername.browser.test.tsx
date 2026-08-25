import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { GameMyUsername } from './GameMyUsername';

const { updateUsername } = vi.hoisted(() => ({
  updateUsername: vi.fn(async () => undefined),
}));

vi.mock('@/features/Game/useGame', () => ({
  useGame: () => ({
    myUserName: 'Alex',
    userNames: {
      me: 'Alex',
      other: 'Sam',
    },
    updateUsername,
    isLoading: false,
  }),
}));

beforeEach(() => {
  updateUsername.mockClear();
});

test('saves a new username from the edit field', async () => {
  await render(
    <BrowserAppShell>
      <GameMyUsername align="center" />
    </BrowserAppShell>,
  );

  await expect.element(page.getByText('Alex')).toBeVisible();
  await userEvent.click(page.getByRole('button', { name: 'Edit username' }));

  const usernameField = page.getByRole('textbox');
  await userEvent.fill(usernameField, 'AlexNew');
  await userEvent.click(page.getByRole('button', { name: 'Save username' }));

  expect(updateUsername).toHaveBeenCalledWith('AlexNew');
});

test('blocks saving a username that is already taken', async () => {
  await render(
    <BrowserAppShell>
      <GameMyUsername align="center" />
    </BrowserAppShell>,
  );

  await userEvent.click(page.getByRole('button', { name: 'Edit username' }));
  await userEvent.fill(page.getByRole('textbox'), 'Sam');

  await expect.element(page.getByText('Username is already taken')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Save username' })).toBeDisabled();
  expect(updateUsername).not.toHaveBeenCalled();
});
