import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { avatars } from '@/features/Game/avatars';
import { QuizPlayerIdentityStep } from './QuizPlayerIdentityStep';

const { updateUsername, setAvatar, onContinue } = vi.hoisted(() => ({
  updateUsername: vi.fn(async () => undefined),
  setAvatar: vi.fn(async () => undefined),
  onContinue: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) =>
    React.createElement('img', { src, alt: alt || '' }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'me',
    loading: false,
    isIdentified: false,
    userInfo: null,
  }),
}));

vi.mock('@/features/Game/useGame', () => ({
  useGame: () => ({
    myUserName: 'AlreadySet',
    userNames: {
      me: 'AlreadySet',
      other: 'Sam',
    },
    updateUsername,
    setAvatar,
    isLoading: false,
  }),
}));

beforeEach(() => {
  updateUsername.mockClear();
  setAvatar.mockClear();
  onContinue.mockClear();
});

const renderStep = () =>
  render(
    <BrowserAppShell>
      <div style={{ width: '360px' }}>
        <QuizPlayerIdentityStep onContinue={onContinue} isStepLoading={false} />
      </div>
    </BrowserAppShell>,
  );

test('starts with an empty username and a horizontal avatar row', async () => {
  await renderStep();

  const username = page.getByRole('textbox', { name: 'Username' });
  await expect.element(username).toHaveValue('');
  await expect.element(page.getByRole('button', { name: 'Next' })).toBeDisabled();

  const picker = document.querySelector('[data-testid="quiz-avatar-picker"]') as HTMLElement;
  const pickerStyle = getComputedStyle(picker);
  expect(pickerStyle.overflowX).toBe('auto');
  expect(pickerStyle.flexWrap).toBe('nowrap');
  expect(pickerStyle.flexDirection).toBe('row');
  expect(picker.scrollWidth).toBeGreaterThan(picker.clientWidth);
  expect(picker.querySelector('[data-selected="true"]')).toBeNull();
});

test('requires a free username and a highlighted avatar before continuing', async () => {
  await renderStep();

  const username = page.getByRole('textbox', { name: 'Username' });
  await userEvent.fill(username, 'Sam');
  await expect.element(page.getByText('Username is already taken')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Next' })).toBeDisabled();

  await userEvent.fill(username, 'Alex');
  await userEvent.click(page.getByRole('option', { name: 'Avatar 1', exact: true }));

  const selected = document.querySelector('[data-selected="true"]') as HTMLElement;
  expect(selected.getAttribute('aria-label')).toBe('Avatar 1');
  const avatarFace = selected.firstElementChild as HTMLElement;
  expect(getComputedStyle(avatarFace).boxShadow).toContain('0, 185, 252');

  await expect.element(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  await userEvent.click(page.getByRole('button', { name: 'Next' }));

  expect(updateUsername).toHaveBeenCalledWith('Alex');
  expect(setAvatar).toHaveBeenCalledWith(avatars[0]);
  expect(onContinue).toHaveBeenCalledOnce();
});
