import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { DemoLanguageCards } from './DemoLanguageCards';

test('dismissing More returns keyboard focus without changing the chosen language', async () => {
  const change = vi.fn();
  await render(
    <BrowserAppShell>
      <DemoLanguageCards language="en" onChange={change} />
    </BrowserAppShell>,
  );
  const more = page.getByRole('button', { name: 'More languages' });
  await userEvent.click(more);
  await expect.element(page.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(more).toHaveFocus();
  expect(change).not.toHaveBeenCalled();
  await expect
    .element(page.getByRole('button', { name: 'English', exact: true }))
    .toHaveAttribute('aria-pressed', 'true');
});
