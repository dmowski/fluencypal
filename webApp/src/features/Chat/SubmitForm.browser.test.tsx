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
        />
      </div>
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('button', { name: 'More options' })).toBeVisible();
  await expect
    .element(page.getByRole('menuitem', { name: 'Type a message' }))
    .not.toBeInTheDocument();

  await userEvent.click(page.getByRole('button', { name: 'More options' }));

  await expect.element(page.getByRole('menuitem', { name: 'Type a message' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Upload image' })).toBeVisible();
  await expect.element(page.getByRole('menuitem', { name: 'Upload video' })).toBeVisible();
  await expect
    .element(page.getByRole('menuitem', { name: 'Suggest an idea' }))
    .not.toBeInTheDocument();

  await userEvent.click(page.getByRole('menuitem', { name: 'Type a message' }));
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

  await userEvent.click(page.getByRole('menuitem', { name: 'Suggest an idea' }));
  expect(onGenerateIdea).toHaveBeenCalledOnce();
});
