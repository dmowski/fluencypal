import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import {
  FluencyCallCardView,
  FluencyCallCardViewProps,
  FluencyCallRowView,
  FluencyCallRowViewProps,
} from './FluencyCallCardView';
import { FluencyCallConductModal } from './FluencyCallConductModal';

const row = (
  overrides: Partial<FluencyCallRowViewProps> & Pick<FluencyCallRowViewProps, 'callId'>,
): FluencyCallRowViewProps => ({
  month: 'OCT',
  day: '4',
  title: 'Tomorrow · 19:00',
  joinCount: 6,
  isJoining: false,
  isLive: false,
  canOpenCall: false,
  unreadCount: 0,
  isJoinPending: false,
  onToggleJoin: () => {},
  onShowChat: () => {},
  onOpenCall: () => {},
  ...overrides,
});

const upcomingRows = [
  row({ callId: 'tue', day: '4', title: 'Tomorrow · 19:00', joinCount: 6 }),
  row({ callId: 'thu', day: '6', title: 'Tuesday · 18:00', joinCount: 4 }),
  row({ callId: 'sat', day: '8', title: 'Thursday · 19:00', joinCount: 9 }),
];

const cardProps: FluencyCallCardViewProps = {
  hasCalls: true,
  canJoin: true,
  requestedAtLabel: null,
  paidNotice: false,
  accessUntilLabel: null,
  timeZoneLabel: 'Warsaw',
  onInitiateCall: () => {},
  onGetAccess: () => {},
};

function renderCard(
  overrides: Partial<FluencyCallCardViewProps> = {},
  rows: FluencyCallRowViewProps[] = upcomingRows,
) {
  const props = { ...cardProps, ...overrides };
  return render(
    <BrowserAppShell>
      <div
        data-testid="fluency-call-shot"
        style={{ width: 640, background: 'rgb(10, 18, 30)', padding: 16 }}
      >
        <FluencyCallCardView {...props}>
          {props.hasCalls
            ? rows.map((item) => <FluencyCallRowView key={item.callId} {...item} />)
            : null}
        </FluencyCallCardView>
      </div>
    </BrowserAppShell>,
  );
}

test('upcoming calls list the week in Warsaw', async () => {
  await renderCard();

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-calls');
});

test('a joined call stays on the list', async () => {
  await renderCard({}, [
    row({ callId: 'tue', isJoining: true, joinCount: 6, title: 'Tomorrow · 19:00' }),
  ]);

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-joined');
});

test('a live call offers the meeting', async () => {
  await renderCard({}, [
    row({
      callId: 'now',
      day: '3',
      title: 'Now · 19:00',
      isLive: true,
      canOpenCall: true,
      isJoining: true,
      joinCount: 8,
    }),
  ]);

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('happening-now');
});

test('show chat carries the unread count', async () => {
  await renderCard({}, [row({ callId: 'tue', unreadCount: 3 })]);

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('unread-chat');
});

test('join and chat buttons notify the row', async () => {
  const onToggleJoin = vi.fn();
  const onShowChat = vi.fn();
  await renderCard({}, [row({ callId: 'tue', onToggleJoin, onShowChat })]);

  await userEvent.click(page.getByTestId('fluency-call-join-tue'));
  await userEvent.click(page.getByTestId('fluency-call-show-chat-tue'));

  expect(onToggleJoin).toHaveBeenCalledTimes(1);
  expect(onShowChat).toHaveBeenCalledTimes(1);
});

test('no call offers a proposal', async () => {
  await renderCard({ hasCalls: false });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('no-call');
});

test('a sent request shows the time and a reply note', async () => {
  await renderCard({ hasCalls: false, requestedAtLabel: 'Tomorrow · 18:00' });

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('request-sent');
});

test('without access the empty card offers the month pass', async () => {
  await renderCard({ hasCalls: false, canJoin: false });

  await expect
    .element(page.getByTestId('fluency-call-shot'))
    .toMatchScreenshot('no-call-non-member');
});

test('propose and change time notify the card', async () => {
  const onInitiateCall = vi.fn();
  await renderCard({ hasCalls: false, onInitiateCall });
  await userEvent.click(page.getByTestId('fluency-call-initiate'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);
});

test('change time notifies the card', async () => {
  const onInitiateCall = vi.fn();
  await renderCard({ hasCalls: false, onInitiateCall, requestedAtLabel: 'Tomorrow · 18:00' });
  await userEvent.click(page.getByTestId('fluency-call-change-time'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);
});

test('the conduct modal agrees or closes', async () => {
  const onAgree = vi.fn();
  const onClose = vi.fn();
  const agreed = await render(
    <BrowserAppShell>
      <FluencyCallConductModal onAgree={onAgree} onClose={onClose} isSaving={false} />
    </BrowserAppShell>,
  );

  await expect.element(page.getByTestId('fluency-call-conduct')).toMatchScreenshot('how-to-behave');
  await userEvent.click(page.getByTestId('fluency-call-conduct-agree'));
  expect(onAgree).toHaveBeenCalledTimes(1);

  agreed.unmount();
  await render(
    <BrowserAppShell>
      <FluencyCallConductModal onAgree={onAgree} onClose={onClose} isSaving={false} />
    </BrowserAppShell>,
  );
  await userEvent.click(page.getByTestId('fluency-call-conduct-close'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
