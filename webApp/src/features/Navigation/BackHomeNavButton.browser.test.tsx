import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { BackHomeNavButton } from './BackHomeNavButton';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

test('Escape on profile with no other windows goes home', async () => {
  push.mockReset();
  window.history.replaceState({}, '', '/ru/practice?page=profile');

  await render(
    <BrowserAppShell>
      <BackHomeNavButton />
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('button', { name: 'Back' })).toBeVisible();
  await userEvent.keyboard('{Escape}');

  expect(push).toHaveBeenCalledWith('/ru/practice', { scroll: true });
});

test('Escape stays on profile when another window param is open', async () => {
  push.mockReset();
  window.history.replaceState({}, '', '/ru/practice?page=profile&help=true');

  await render(
    <BrowserAppShell>
      <BackHomeNavButton />
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('button', { name: 'Back' })).toBeVisible();
  await userEvent.keyboard('{Escape}');

  expect(push).not.toHaveBeenCalled();
});
