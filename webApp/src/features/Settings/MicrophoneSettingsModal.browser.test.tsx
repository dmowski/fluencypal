import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { readPreferredMicrophoneId } from '@/libs/mic';
import { MicrophoneSettingsModal } from './MicrophoneSettingsModal';

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('@/libs/mic', async () => {
  const actual = await vi.importActual<typeof import('@/libs/mic')>('@/libs/mic');
  return {
    ...actual,
    loadAudioInputDevices: vi.fn(async () => [
      { deviceId: 'mic-1', label: 'Built-in Microphone' },
      { deviceId: 'mic-2', label: 'USB Headset' },
    ]),
  };
});

test('microphone settings can select the preferred microphone', async () => {
  window.localStorage.removeItem('preferredMicrophoneId');
  window.localStorage.removeItem('voiceChatPreferredMicrophoneId');

  const onClose = vi.fn();

  await render(
    <BrowserAppShell>
      <MicrophoneSettingsModal onClose={onClose} />
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('button', { name: 'System default' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Built-in Microphone' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'USB Headset' })).toBeVisible();

  await userEvent.click(page.getByRole('button', { name: 'USB Headset' }));

  expect(readPreferredMicrophoneId()).toBe('mic-2');
  await expect
    .element(page.getByRole('button', { name: 'USB Headset' }))
    .toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(page.getByRole('button', { name: 'Done' }));
  expect(onClose).toHaveBeenCalledOnce();
});
