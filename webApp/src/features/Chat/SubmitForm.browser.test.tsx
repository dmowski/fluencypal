import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { SubmitFormMoreOptions } from './SubmitFormMoreOptions';

vi.mock('@/features/Game/UploadImageButton', () => ({
  UploadImageButton: () => <button type="button">hidden-image-upload</button>,
}));

vi.mock('@/features/Video/UploadVideoButton', () => ({
  UploadVideoButton: () => <button type="button">hidden-video-upload</button>,
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

test('voice menu hides extra actions behind more options', async () => {
  const onSwitchMode = vi.fn();
  const onAddImage = vi.fn();
  const onAddVideo = vi.fn();

  await render(
    <BrowserAppShell>
      <div data-testid="submit-form-more-options-fixture" style={{ padding: 40 }}>
        <SubmitFormMoreOptions
          isTextMode={false}
          onSwitchMode={onSwitchMode}
          onAddImage={onAddImage}
          onAddVideo={onAddVideo}
          onSelectMicrophone={vi.fn()}
        />
      </div>
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('button', { name: 'More options' })).toBeVisible();
  await expect
    .element(page.getByRole('menuitem', { name: 'Text message' }))
    .not.toBeInTheDocument();

  await userEvent.click(page.getByRole('button', { name: 'More options' }));

  await expect.element(page.getByRole('menuitem', { name: 'Text message' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Microphone' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Upload image' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Upload video' })).toBeVisible();
  await expect
    .element(page.getByRole('menuitem', { name: 'Suggest an idea' }))
    .not.toBeInTheDocument();

  await userEvent.click(page.getByRole('menuitem', { name: 'Text message' }));
  expect(onSwitchMode).toHaveBeenCalledOnce();
});

test('text menu includes voice, uploads, idea, and check actions', async () => {
  const onSwitchMode = vi.fn();
  const onGenerateIdea = vi.fn();
  const onCheckMessage = vi.fn();

  await render(
    <BrowserAppShell>
      <div data-testid="submit-form-more-options-fixture" style={{ padding: 40 }}>
        <SubmitFormMoreOptions
          isTextMode={true}
          onSwitchMode={onSwitchMode}
          onAddImage={() => undefined}
          onAddVideo={() => undefined}
          onGenerateIdea={onGenerateIdea}
          onCheckMessage={onCheckMessage}
          canGenerateIdea={true}
          canCheckMessage={false}
        />
      </div>
    </BrowserAppShell>,
  );

  await userEvent.click(page.getByRole('button', { name: 'More options' }));

  await expect.element(page.getByRole('menuitem', { name: 'Voice message' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Upload image' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Upload video' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Suggest an idea' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Check my message' })).toBeDisabled();
  await expect.element(page.getByRole('menuitem', { name: 'Microphone' })).not.toBeInTheDocument();

  await userEvent.click(page.getByRole('menuitem', { name: 'Suggest an idea' }));
  expect(onGenerateIdea).toHaveBeenCalledOnce();
});

test('voice menu can select a microphone for recording', async () => {
  const onSelectMicrophone = vi.fn();

  await render(
    <BrowserAppShell>
      <div data-testid="submit-form-more-options-fixture" style={{ padding: 40 }}>
        <SubmitFormMoreOptions
          isTextMode={false}
          onAddImage={() => undefined}
          onAddVideo={() => undefined}
          microphoneDeviceId={null}
          onSelectMicrophone={onSelectMicrophone}
        />
      </div>
    </BrowserAppShell>,
  );

  await userEvent.click(page.getByRole('button', { name: 'More options' }));
  await userEvent.click(page.getByRole('menuitem', { name: 'Microphone' }));

  await expect.element(page.getByRole('menuitem', { name: 'System default' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Built-in Microphone' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'USB Headset' })).toBeVisible();

  await userEvent.click(page.getByRole('menuitem', { name: 'USB Headset' }));
  expect(onSelectMicrophone).toHaveBeenCalledWith('mic-2');
});
