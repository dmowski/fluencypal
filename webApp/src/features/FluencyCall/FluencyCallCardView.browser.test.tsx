import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { FluencyCallCardView, FluencyCallCardViewProps } from './FluencyCallCardView';

const baseProps: FluencyCallCardViewProps = {
  startsAtLabel: 'Saturday, 3 Oct, 18:00',
  countdown: { days: 1, hours: 4, minutes: 12, seconds: 0, isLive: false },
  isMember: true,
  membershipReady: true,
  isJoining: false,
  joinCount: 3,
  canOpenCall: false,
  isJoinPending: false,
  onToggleJoin: () => {},
  onShowChat: () => {},
  unreadCount: 0,
  onJoinMembership: () => {},
  onOpenCall: () => {},
};

function renderCard(overrides: Partial<FluencyCallCardViewProps> = {}) {
  return render(
    <BrowserAppShell>
      <div
        data-testid="fluency-call-shot"
        style={{ width: 640, background: 'rgb(10, 18, 30)', padding: 16 }}
      >
        <style>{'[data-testid="fluency-call-shot"] * { animation: none !important; }'}</style>
        <FluencyCallCardView {...baseProps} {...overrides} />
      </div>
    </BrowserAppShell>,
  );
}

test('upcoming call for a member', async () => {
  await renderCard();

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-member');
});

test('member who will join, with the people count', async () => {
  await renderCard({ isJoining: true, joinCount: 12 });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-joined');
});

test('non-member sees join membership', async () => {
  await renderCard({ isMember: false, joinCount: 0 });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('non-member');
});

test('live call offers the meeting link', async () => {
  await renderCard({
    countdown: { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true },
    canOpenCall: true,
    isJoining: true,
    joinCount: 8,
  });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('happening-now');
});

test('show chat carries the unread count', async () => {
  await renderCard({ unreadCount: 3 });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('unread-chat');
});

test('join and chat buttons notify the card', async () => {
  const onToggleJoin = vi.fn();
  const onShowChat = vi.fn();
  await renderCard({ onToggleJoin, onShowChat });

  await userEvent.click(page.getByTestId('fluency-call-join'));
  await userEvent.click(page.getByTestId('fluency-call-show-chat'));

  expect(onToggleJoin).toHaveBeenCalledTimes(1);
  expect(onShowChat).toHaveBeenCalledTimes(1);
});
