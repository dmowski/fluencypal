import React from 'react';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
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
import { formatCallLabel } from './callTime';
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
  languageCode: 'en',
  requestedAtLabel: null,
  paidNotice: false,
  accessUntilLabel: null,
  timeZoneLabel: 'Warsaw',
  onLanguageChange: () => {},
  onInitiateCall: () => {},
  onGetAccess: () => {},
};

function renderCard(
  overrides: Partial<FluencyCallCardViewProps> = {},
  rows: FluencyCallRowViewProps[] = upcomingRows,
  width = 640,
) {
  const props = { ...cardProps, ...overrides };
  return render(
    <BrowserAppShell>
      <div
        data-testid="fluency-call-shot"
        style={{ width, background: 'rgb(10, 18, 30)', padding: 16 }}
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

const ruCallCopy = setupI18n({
  locale: 'ru',
  messages: {
    ru: {
      "I'll join": ['Я присоединюсь'],
      '{count} joining': [['count'], ' присоединяется'],
      'Show chat': ['Показать чат'],
    },
  },
});

async function box(testId: string) {
  const element = await page.getByTestId(testId).element();
  return element.getBoundingClientRect();
}

test('upcoming calls list the week in Warsaw', async () => {
  await renderCard();

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-calls');
});

test('a Vietnamese month stays on one line inside the date badge', async () => {
  const label = formatCallLabel(
    '2026-10-06T16:00:00.000Z',
    new Date('2026-10-03T16:00:00.000Z'),
    'vi',
    'Europe/Warsaw',
  );
  await renderCard({}, [
    row({
      callId: 'vi',
      month: label?.month ?? '',
      day: label?.day ?? '',
      title: 'Thứ Ba · 18:00',
      joinCount: 1,
    }),
  ]);

  const badge = await box('fluency-call-date-vi');
  const month = (await page.getByText('T10').element()).getBoundingClientRect();
  const day = (await page.getByText('6', { exact: true }).element()).getBoundingClientRect();

  expect(month.width).toBeLessThanOrEqual(badge.width);
  expect(month.height).toBeLessThan(16);
  expect(month.top).toBeGreaterThanOrEqual(badge.top);
  expect(month.bottom).toBeLessThanOrEqual(day.top);
  expect(day.bottom).toBeLessThanOrEqual(badge.bottom + 1);
});

test('a narrow card stacks the join actions under the call', async () => {
  await render(
    <BrowserAppShell>
      <I18nProvider i18n={ruCallCopy}>
        <div
          data-testid="fluency-call-shot"
          style={{ width: 340, background: 'rgb(10, 18, 30)', padding: 0 }}
        >
          <FluencyCallCardView {...cardProps} timeZoneLabel="Europe/Warsaw">
            <FluencyCallRowView
              {...row({
                callId: 'tue',
                month: 'ОКТ',
                day: '4',
                title: 'Сегодня · 19:00',
                joinCount: 0,
              })}
            />
          </FluencyCallCardView>
        </div>
      </I18nProvider>
    </BrowserAppShell>,
  );

  const card = await box('fluency-call-card');
  const title = (await page.getByText('Сегодня · 19:00').element()).getBoundingClientRect();
  const count = await box('fluency-call-join-count-tue');
  const join = await box('fluency-call-join-tue');
  const chat = await box('fluency-call-show-chat-tue');

  expect(join.right).toBeLessThanOrEqual(card.right + 1);
  expect(join.left).toBeGreaterThanOrEqual(card.left);
  expect(chat.left).toBeGreaterThanOrEqual(card.left);
  expect(join.top).toBeGreaterThanOrEqual(title.bottom - 1);
  expect(join.top).toBeGreaterThanOrEqual(count.bottom - 1);
  expect(Math.abs(chat.top - join.top)).toBeLessThan(4);

  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('upcoming-narrow');
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

test('the language dropdown filters by the chosen language', async () => {
  const onLanguageChange = vi.fn();
  await renderCard({ onLanguageChange });

  await userEvent.click(page.getByTestId('fluency-call-language-filter'));
  await userEvent.click(page.getByRole('option', { name: /Español/ }));

  expect(onLanguageChange).toHaveBeenCalledWith('es');
});

test('listed calls still offer a proposal', async () => {
  const onInitiateCall = vi.fn();
  await renderCard({ onInitiateCall });

  await userEvent.click(page.getByTestId('fluency-call-initiate'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);
});

test('a listed call keeps a sent request editable', async () => {
  const onInitiateCall = vi.fn();
  await renderCard({ onInitiateCall, requestedAtLabel: 'Tomorrow · 18:00' });

  await expect.element(page.getByTestId('fluency-call-request-sent')).toBeVisible();
  await userEvent.click(page.getByTestId('fluency-call-change-time'));
  expect(onInitiateCall).toHaveBeenCalledTimes(1);
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
