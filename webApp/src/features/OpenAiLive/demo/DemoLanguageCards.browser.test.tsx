import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { DemoLanguageCards } from './DemoLanguageCards';

test('closing the language menu returns focus without changing the chosen language', async () => {
  const change = vi.fn();
  await render(
    <BrowserAppShell>
      <DemoLanguageCards language="en" onChange={change} />
    </BrowserAppShell>,
  );
  const trigger = page.getByRole('button', { name: 'English', exact: true });
  await userEvent.click(trigger);
  await expect.element(page.getByRole('menuitem', { name: 'Polish', exact: true })).toBeVisible();
  await expect
    .element(page.getByRole('menuitem', { name: 'Russian', exact: true }))
    .not.toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await expect.element(trigger).toHaveFocus();
  expect(change).not.toHaveBeenCalled();
  await expect
    .element(page.getByRole('button', { name: 'English', exact: true }))
    .toHaveAttribute('aria-expanded', 'false');
});
