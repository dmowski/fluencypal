import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { defaultAvatar } from '@/features/Game/avatars';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { FluencyCallChatTabs } from './FluencyCallChatTabs';
import { FluencyCallParticipants } from './FluencyCallParticipants';

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockNextImage({ src, alt }: { src: string; alt: string }) {
    return <img src={src} alt={alt} />;
  },
}));

const participants = [
  { userId: 'user-mina', userName: 'Mina', avatarUrl: defaultAvatar },
  { userId: 'user-alex', userName: 'Alex', avatarUrl: defaultAvatar },
];

test('tabs show one panel at a time', async () => {
  await render(
    <BrowserAppShell>
      <FluencyCallChatTabs
        chat={<div data-testid="fluency-call-chat-body">chat</div>}
        participants={<div data-testid="fluency-call-participants-body">people</div>}
      />
    </BrowserAppShell>,
  );

  await expect.element(page.getByTestId('fluency-call-chat-body')).toBeVisible();
  await expect.element(page.getByTestId('fluency-call-participants-body')).not.toBeInTheDocument();

  await userEvent.click(page.getByRole('tab', { name: 'Participants' }));

  await expect.element(page.getByTestId('fluency-call-chat-body')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('fluency-call-participants-body')).toBeVisible();
});

test('participants list shows who will join', async () => {
  const onOpenParticipant = vi.fn();
  await render(
    <BrowserAppShell>
      <FluencyCallParticipants
        participants={participants}
        loading={false}
        onOpenParticipant={onOpenParticipant}
      />
    </BrowserAppShell>,
  );

  await expect.element(page.getByRole('button', { name: 'Alex' })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Mina' })).toBeVisible();

  await userEvent.click(page.getByRole('button', { name: 'Alex' }));
  expect(onOpenParticipant).toHaveBeenCalledWith('user-alex');
});

test('participants list explains when nobody will join', async () => {
  await render(
    <BrowserAppShell>
      <FluencyCallParticipants participants={[]} loading={false} onOpenParticipant={() => {}} />
    </BrowserAppShell>,
  );

  await expect.element(page.getByTestId('fluency-call-participants-empty')).toBeVisible();
});
