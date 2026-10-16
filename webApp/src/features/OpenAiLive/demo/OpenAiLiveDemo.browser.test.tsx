import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { WindowSizesProvider } from '@/features/Layout/useWindowSizes';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { OpenAiLiveDemo } from './OpenAiLiveDemo';

const start = vi.hoisted(() => vi.fn());
const mic = vi.hoisted(() => ({
  granted: vi.fn(async () => false),
  denied: vi.fn(async () => false),
  request: vi.fn(async () => true),
}));

vi.mock('./api', () => ({
  demoRequest: vi.fn(async () => ({ used: false, language: 'en', lines: [] })),
}));

vi.mock('./useDemoCall', () => ({
  useDemoCall: () => ({
    phase: 'idle',
    error: null,
    lines: [],
    remaining: 180_000,
    muted: false,
    needsUnlock: false,
    start,
    end: vi.fn(),
    toggleMute: vi.fn(),
    unlock: vi.fn(),
  }),
}));

vi.mock('@/libs/mic', () => ({
  isMicrophoneGranted: mic.granted,
  isMicrophoneDenied: mic.denied,
  requestMicrophoneAccess: mic.request,
}));

const renderDemo = () =>
  render(
    <BrowserAppShell>
      <WindowSizesProvider>
        <OpenAiLiveDemo />
      </WindowSizesProvider>
    </BrowserAppShell>,
  );

beforeEach(() => {
  start.mockClear();
  mic.granted.mockReset();
  mic.denied.mockReset();
  mic.request.mockReset();
  mic.granted.mockResolvedValue(false);
  mic.denied.mockResolvedValue(false);
  mic.request.mockResolvedValue(true);
});

test('Start explains the microphone prompt before the call begins', async () => {
  await renderDemo();
  await userEvent.click(page.getByRole('button', { name: 'Start my free conversation' }));

  await expect.element(page.getByRole('heading', { name: 'Microphone access needed' })).toBeVisible();
  await expect
    .element(page.getByText('Choose "Allow" so the conversation can start.', { exact: false }))
    .toBeVisible();
  expect(start).not.toHaveBeenCalled();

  await userEvent.click(page.getByRole('button', { name: 'Grant microphone permission' }));
  await expect.poll(() => start.mock.calls.length).toBe(1);
  expect(start).toHaveBeenCalledWith('en', { micAlreadyGranted: true });
  await expect
    .element(page.getByRole('heading', { name: 'Microphone access needed' }))
    .not.toBeInTheDocument();
});

test('Start begins the call when the microphone is already allowed', async () => {
  mic.granted.mockResolvedValue(true);
  await renderDemo();
  await userEvent.click(page.getByRole('button', { name: 'Start my free conversation' }));
  await expect.poll(() => start.mock.calls.length).toBe(1);
  expect(start).toHaveBeenCalledWith('en', { micAlreadyGranted: true });
  await expect
    .element(page.getByRole('heading', { name: 'Microphone access needed' }))
    .not.toBeInTheDocument();
});

test('Not now leaves the call unstarted', async () => {
  await renderDemo();
  await userEvent.click(page.getByRole('button', { name: 'Start my free conversation' }));
  await userEvent.click(page.getByRole('button', { name: 'Not now' }));
  expect(start).not.toHaveBeenCalled();
  await expect
    .element(page.getByRole('heading', { name: 'Microphone access needed' }))
    .not.toBeInTheDocument();
  await expect.element(page.getByRole('button', { name: 'Start my free conversation' })).toBeVisible();
});
