import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { WindowSizesProvider } from '@/features/Layout/useWindowSizes';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import {
  FLUENCY_CALL_CHAT_PAGE,
  FluencyCallCardCall,
  FluencyCallCardMessage,
  FluencyCallCardView,
  FluencyCallCardViewProps,
} from './FluencyCallCardView';
import { FluencyCallConductModal } from './FluencyCallConductModal';

const call = (
  overrides: Partial<FluencyCallCardCall> & Pick<FluencyCallCardCall, 'id'>,
): FluencyCallCardCall => ({
  title: 'Tomorrow · 19:00',
  dateLabel: 'Sunday, 4 October',
  participantCount: 6,
  isJoining: false,
  isLive: false,
  ...overrides,
});

const message = (
  overrides: Partial<FluencyCallCardMessage> & Pick<FluencyCallCardMessage, 'id' | 'text'>,
): FluencyCallCardMessage => ({
  authorName: 'Maria',
  createdAt: '2026-10-03T12:30:00.000Z',
  timeLabel: '14:30',
  ...overrides,
});

const cardProps: FluencyCallCardViewProps = {
  calls: [
    call({ id: 'tue' }),
    call({
      id: 'thu',
      title: 'Tuesday · 18:00',
      dateLabel: 'Tuesday, 6 October',
      participantCount: 4,
    }),
  ],
  languageCode: 'en',
  onLanguageChange: () => {},
  timeZoneLabel: 'Warsaw',
  meetUrl: 'https://meet.example.com/room',
  messages: [
    message({ id: 'older', text: 'See you next time' }),
    message({ id: 'latest', text: 'Hi everyone' }),
  ],
  onToggleJoining: async () => {},
  onSendMessage: async () => {},
  canJoin: true,
  requestedAtLabel: null,
  paidNotice: false,
  onInitiateCall: () => {},
};

function renderCard(overrides: Partial<FluencyCallCardViewProps> = {}, width = 640) {
  const props = { ...cardProps, ...overrides };
  return render(
    <BrowserAppShell>
      <WindowSizesProvider>
        <div
          data-testid="fluency-call-shot"
          style={{ width, background: 'rgb(10, 18, 30)', padding: 16 }}
        >
          <FluencyCallCardView {...props} />
        </div>
      </WindowSizesProvider>
    </BrowserAppShell>,
  );
}

async function box(testId: string) {
  const element = await page.getByTestId(testId).element();
  return element.getBoundingClientRect();
}

test('the card shows the next call and keeps the others behind Other times', async () => {
  await renderCard();

  await expect.element(page.getByText('Tomorrow · 19:00')).toBeVisible();
  await expect.element(page.getByText('Tuesday · 18:00')).not.toBeInTheDocument();
  await expect.element(page.getByText('Hi everyone')).toBeVisible();
  await expect.element(page.getByText('See you next time')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-calls');

  await userEvent.click(page.getByTestId('fluency-call-other-times'));
  await expect
    .element(page.getByRole('heading', { name: 'Upcoming conversations' }))
    .toBeVisible();
  await expect.element(page.getByTestId('fluency-call-other-thu')).toBeVisible();
  await expect.element(page.getByText('See you next time')).not.toBeInTheDocument();
  await expect.element(page.getByTestId('fluency-call-message-latest')).toBeInTheDocument();

  await userEvent.keyboard('{Escape}');
  await expect.element(page.getByTestId('fluency-call-schedule-modal')).not.toBeInTheDocument();
  await expect.element(page.getByText('Tuesday · 18:00')).not.toBeInTheDocument();
});

test('a narrow card keeps the meeting and the reply inside the card', async () => {
  await renderCard({}, 320);

  const card = await box('fluency-call-card');
  const meet = await box('fluency-call-open');
  const join = await box('fluency-call-join-tue');

  expect(meet.right).toBeLessThanOrEqual(card.right + 1);
  expect(meet.left).toBeGreaterThanOrEqual(card.left);
  expect(join.right).toBeLessThanOrEqual(card.right + 1);
  expect(join.left).toBeGreaterThanOrEqual(card.left);
  expect(join.top).toBeGreaterThanOrEqual(meet.bottom - 1);

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-narrow');
});

test('a joined call stays on the card', async () => {
  await renderCard({
    calls: [call({ id: 'tue', isJoining: true })],
    messages: [],
  });

  await expect
    .element(page.getByTestId('fluency-call-join-tue'))
    .toHaveAttribute('aria-pressed', 'true');
  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-joined');
});

test('Google Meet stays available before the call starts and does not change the RSVP', async () => {
  const onToggleJoining = vi.fn(async () => {});
  await renderCard({ onToggleJoining });

  const link = page.getByTestId('fluency-call-open');
  await expect.element(link).toHaveAttribute('href', 'https://meet.example.com/room');
  const element = await link.element();
  element.addEventListener('click', (event) => event.preventDefault());
  await userEvent.click(link);

  expect(onToggleJoining).not.toHaveBeenCalled();
});

test('a live call still opens the same meeting', async () => {
  await renderCard({
    calls: [
      call({ id: 'now', title: 'Now · 19:00', isLive: true, isJoining: true, participantCount: 8 }),
    ],
    messages: [],
  });

  await expect
    .element(page.getByTestId('fluency-call-open'))
    .toHaveAttribute('href', 'https://meet.example.com/room');
  await expect.element(page.getByTestId('fluency-call-live-now')).toBeVisible();
  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('happening-now');
});

test('show older reveals history and hide older collapses it', async () => {
  await renderCard();

  await userEvent.click(page.getByTestId('fluency-call-show-older'));
  await expect.element(page.getByText('See you next time')).toBeVisible();
  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('chat-older');

  await userEvent.click(page.getByTestId('fluency-call-show-older'));
  await expect.element(page.getByText('See you next time')).not.toBeInTheDocument();
  await expect.element(page.getByText('Hi everyone')).toBeVisible();
});

test('load more reveals messages above the first page', async () => {
  const messages = Array.from({ length: FLUENCY_CALL_CHAT_PAGE + 1 }, (_, index) =>
    message({ id: `m-${index}`, text: `Message ${index}` }),
  );
  await renderCard({ messages });

  await userEvent.click(page.getByTestId('fluency-call-show-older'));
  await expect.element(page.getByText('Message 0')).not.toBeInTheDocument();
  await userEvent.click(page.getByTestId('fluency-call-load-older'));
  await expect.element(page.getByText('Message 0')).toBeVisible();
});

test('a failed reply keeps the draft', async () => {
  await renderCard({
    messages: [],
    onSendMessage: async () => {
      throw new Error('offline');
    },
  });

  const draft = page.getByRole('textbox', { name: 'Message the group' });
  await userEvent.fill(draft, 'Hello there');
  await userEvent.click(page.getByTestId('fluency-call-send'));

  await expect.element(page.getByTestId('fluency-call-error')).toBeVisible();
  await expect.element(draft).toHaveValue('Hello there');
});

test('you can edit your own message and a failure keeps the draft', async () => {
  const onEditMessage = vi.fn(async () => {
    throw new Error('offline');
  });
  await renderCard({
    messages: [message({ id: 'mine', text: 'Hi everyone', isMine: true })],
    onEditMessage,
  });

  await expect.element(page.getByTestId('fluency-call-edit-mine')).not.toBeInTheDocument();
  await userEvent.click(page.getByTestId('fluency-call-message-menu-mine'));
  await userEvent.click(page.getByTestId('fluency-call-edit-mine'));
  const editor = page.getByRole('textbox', { name: 'Edit message' });
  await userEvent.fill(editor, 'Hi again');
  await userEvent.click(page.getByTestId('fluency-call-edit-save-mine'));

  expect(onEditMessage).toHaveBeenCalledWith('mine', 'Hi again');
  await expect.element(page.getByTestId('fluency-call-error')).toBeVisible();
  await expect.element(editor).toHaveValue('Hi again');

  await userEvent.click(page.getByTestId('fluency-call-edit-cancel-mine'));
  await expect.element(page.getByText('Hi everyone')).toBeVisible();
});

test('translate replaces the message and a second choice restores it', async () => {
  const onTranslate = vi.fn(async (text: string) => `ES: ${text}`);
  await renderCard({
    messages: [message({ id: 'theirs', text: 'Hi everyone' })],
    onTranslate,
  });

  await userEvent.click(page.getByTestId('fluency-call-message-menu-theirs'));
  await userEvent.click(page.getByTestId('fluency-call-translate-theirs'));
  await expect.element(page.getByText('ES: Hi everyone')).toBeVisible();
  expect(onTranslate).toHaveBeenCalledWith('Hi everyone');

  await userEvent.click(page.getByTestId('fluency-call-message-menu-theirs'));
  await expect.element(page.getByText('See original')).toBeVisible();
  await userEvent.click(page.getByTestId('fluency-call-translate-theirs'));
  await expect.element(page.getByText('Hi everyone')).toBeVisible();
  await expect.element(page.getByText('ES: Hi everyone')).not.toBeInTheDocument();
  expect(onTranslate).toHaveBeenCalledTimes(1);
});

test('you can delete your own message and someone else cannot', async () => {
  const onDeleteMessage = vi.fn(async () => {});
  await renderCard({
    messages: [
      message({ id: 'theirs', text: 'See you next time' }),
      message({ id: 'mine', text: 'Hi everyone', isMine: true }),
    ],
    onDeleteMessage,
    initialChatExpanded: true,
  });

  await expect.element(page.getByTestId('fluency-call-message-menu-theirs')).not.toBeInTheDocument();

  await userEvent.click(page.getByTestId('fluency-call-message-menu-mine'));
  await userEvent.click(page.getByTestId('fluency-call-delete-mine'));
  await expect
    .element(page.getByText('Are you sure you want to delete this message?'))
    .toBeVisible();
  await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
  expect(onDeleteMessage).not.toHaveBeenCalled();

  await userEvent.click(page.getByTestId('fluency-call-message-menu-mine'));
  await userEvent.click(page.getByTestId('fluency-call-delete-mine'));
  await userEvent.click(page.getByTestId('fluency-call-delete-confirm-mine'));
  expect(onDeleteMessage).toHaveBeenCalledWith('mine');
});

test('a failed RSVP stays on I will join', async () => {
  await renderCard({
    messages: [],
    calls: [call({ id: 'tue' })],
    onToggleJoining: async () => {
      throw new Error('offline');
    },
  });

  await userEvent.click(page.getByTestId('fluency-call-join-tue'));
  await expect.element(page.getByTestId('fluency-call-error')).toBeVisible();
  await expect
    .element(page.getByTestId('fluency-call-join-tue'))
    .toHaveAttribute('aria-pressed', 'false');
});

test('an RSVP shows a pending label until it finishes', async () => {
  let finish = () => {};
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  await renderCard({
    messages: [],
    calls: [call({ id: 'tue' })],
    onToggleJoining: () => pending,
  });

  await userEvent.click(page.getByTestId('fluency-call-join-tue'));
  await expect.element(page.getByText('Updating...')).toBeVisible();
  finish();
  await expect.element(page.getByText("I'll join")).toBeVisible();
});

test('a long message stays inside the card', async () => {
  await renderCard(
    {
      messages: [
        message({
          id: 'long',
          authorName: 'A very long display name that should wrap onto another line',
          text: 'supercalifragilistic'.repeat(12),
        }),
      ],
    },
    320,
  );

  const card = await box('fluency-call-card');
  const body = await box('fluency-call-message-long');
  expect(body.right).toBeLessThanOrEqual(card.right + 1);
  expect(body.left).toBeGreaterThanOrEqual(card.left);
});

test('no call still offers the meeting and a proposal', async () => {
  const onInitiateCall = vi.fn();
  await renderCard({ calls: [], messages: [], onInitiateCall });

  await expect
    .element(page.getByTestId('fluency-call-open'))
    .toHaveAttribute('href', 'https://meet.example.com/room');
  await expect.element(page.getByTestId('fluency-call-chat-empty')).toBeVisible();
  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('no-call');

  await userEvent.click(page.getByTestId('fluency-call-other-times'));
  await expect.element(page.getByTestId('fluency-call-no-other')).toBeVisible();
  await userEvent.click(page.getByTestId('fluency-call-initiate'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);
});

test('the meeting control stays when there is no saved link', async () => {
  await renderCard({ calls: [], messages: [], meetUrl: null });

  const meet = page.getByTestId('fluency-call-open');
  await expect.element(meet).toBeDisabled();
  const element = await meet.element();
  expect(element.getAttribute('href')).toBeNull();
});

test('who is joining sits on that call', async () => {
  await renderCard({
    messages: [],
    callPeople: (item) => (
      <span data-testid={`fluency-call-people-${item.id}`}>{`Who's joining · ${item.title}`}</span>
    ),
  });

  await userEvent.click(page.getByTestId('fluency-call-other-times'));

  const next = await page.getByTestId('fluency-call-other-tue').element();
  const later = await page.getByTestId('fluency-call-other-thu').element();
  expect(next.textContent).toContain("Who's joining · Tomorrow · 19:00");
  expect(later.textContent).toContain("Who's joining · Tuesday · 18:00");
  expect(next.querySelector('[data-testid="fluency-call-people-thu"]')).toBeNull();
});

test('a sent request shows the time inside other times', async () => {
  const onInitiateCall = vi.fn();
  await renderCard({
    calls: [call({ id: 'tue' })],
    messages: [],
    requestedAtLabel: 'English · Tomorrow · 18:00',
    onInitiateCall,
  });

  await userEvent.click(page.getByTestId('fluency-call-other-times'));
  await expect.element(page.getByTestId('fluency-call-request-sent')).toBeVisible();
  await userEvent.click(page.getByTestId('fluency-call-change-time'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);
  await expect.element(page.getByTestId('fluency-call-schedule-modal')).toMatchScreenshot('request-sent');
});

test('the language menu names the chosen language', async () => {
  const onLanguageChange = vi.fn();
  await renderCard({ onLanguageChange, messages: [] });

  await userEvent.click(page.getByTestId('fluency-call-language-filter'));
  await userEvent.click(page.getByRole('option', { name: /Español/ }));

  expect(onLanguageChange).toHaveBeenCalledWith('es');
});

test('the welcome note has no video player', async () => {
  await renderCard({ messages: [], calls: [call({ id: 'tue' })] });

  await userEvent.click(page.getByTestId('fluency-call-welcome'));
  await expect.element(page.getByRole('heading', { name: 'A hello from Alex' })).toBeVisible();
  expect(document.querySelector('video')).toBeNull();

  await userEvent.keyboard('{Escape}');
  await expect.element(page.getByTestId('fluency-call-welcome-modal')).not.toBeInTheDocument();
});

test('the host intro uses the muted preview of the real video', async () => {
  await renderCard({
    messages: [],
    calls: [call({ id: 'tue' })],
    welcomeVideoSrc: '/group_call/intro.webm',
  });

  const preview = (await page
    .getByTestId('fluency-call-welcome-preview')
    .element()) as HTMLVideoElement;
  expect(preview.getAttribute('src')).toBe('/group_call/intro.webm');
  expect(preview.muted).toBe(true);
  expect(preview.loop).toBe(true);

  await userEvent.click(page.getByTestId('fluency-call-welcome'));
  const video = (await page.getByTestId('muted-preview-video').element()) as HTMLVideoElement;
  expect(video.getAttribute('src')).toBe('/group_call/intro.webm');
  expect(video.muted).toBe(true);
  await expect.element(page.getByTestId('muted-preview-unmute')).toBeVisible();
  await expect.element(page.getByRole('heading', { name: 'A hello from Alex' })).toBeVisible();
});

const renderConductModal = (props: {
  onAgree: () => void;
  onClose: () => void;
  isSaving?: boolean;
}) =>
  render(
    <BrowserAppShell>
      <WindowSizesProvider>
        <FluencyCallConductModal isSaving={false} {...props} />
      </WindowSizesProvider>
    </BrowserAppShell>,
  );

test('the conduct modal agrees or closes', async () => {
  const onAgree = vi.fn();
  const onClose = vi.fn();
  const agreed = await renderConductModal({ onAgree, onClose });

  await expect.element(page.getByTestId('fluency-call-conduct')).toMatchScreenshot('how-to-behave');
  await userEvent.click(page.getByTestId('fluency-call-conduct-agree'));
  expect(onAgree).toHaveBeenCalledTimes(1);

  agreed.unmount();
  const closed = await renderConductModal({ onAgree, onClose });
  await userEvent.click(page.getByTestId('fluency-call-conduct-close'));
  expect(onClose).toHaveBeenCalledTimes(1);
  closed.unmount();
});
