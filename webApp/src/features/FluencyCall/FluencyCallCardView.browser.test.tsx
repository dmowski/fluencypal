import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { WindowSizesProvider } from '@/features/Layout/useWindowSizes';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { FluencyCallCardView, FluencyCallCardViewProps } from './FluencyCallCardView';
import { FluencyCallConductModal } from './FluencyCallConductModal';

dayjs.extend(relativeTime);

const chatSpies = vi.hoisted(() => ({
  onOpen: vi.fn(),
}));

vi.mock('@/features/Chat/useChat', () => ({
  useChat: () => ({
    onOpen: chatSpies.onOpen,
    viewMessage: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
    deleteMessageAttachment: vi.fn(),
    reportMessage: vi.fn(),
    commentsInfo: {},
    messagesLikes: {},
    toggleLike: vi.fn(),
    setActiveCommentMessageId: vi.fn(),
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'me',
    getToken: async () => 'signed-in-token',
  }),
}));

vi.mock('@/features/Game/useGame', () => ({
  useGame: () => ({
    getUserName: (userId: string) =>
      userId === 'long-name'
        ? 'A very long display name that should wrap onto another line'
        : 'Maria',
    getUserAvatarUrl: () => '',
    showUserInModal: () => {},
    gameLastVisit: null,
    userNames: {},
    myUserName: null,
    stats: [],
  }),
}));

vi.mock('@/features/Translation/useTranslate', () => ({
  useTranslate: () => ({
    isTranslateAvailable: true,
    translateText: async ({ text }: { text: string }) => text,
  }),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockNextImage({
    src,
    alt,
    style,
  }: {
    src: string;
    alt: string;
    style?: React.CSSProperties;
  }) {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          ...style,
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  },
}));

const cardProps: FluencyCallCardViewProps = {
  canJoin: true,
  paidNotice: false,
  welcomeVideoSrc: '/group_call/intro2.webm',
  onOpenVoiceChat: () => {},
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

/** A playing intro never settles, so every shot holds the same frame. */
async function holdVideoFrame() {
  const video = (await page.getByTestId('muted-preview-video').element()) as HTMLVideoElement;
  if (video.readyState < 2) {
    await new Promise<void>((resolve) => {
      video.addEventListener('loadeddata', () => resolve(), { once: true });
    });
  }
  video.pause();
  video.loop = false;
  if (video.currentTime > 0.05) {
    await new Promise<void>((resolve) => {
      video.addEventListener('seeked', () => resolve(), { once: true });
      video.currentTime = 0;
    });
  }
}

test('the card shows the host video beside a request for a group call', async () => {
  await renderCard();

  await expect
    .element(page.getByRole('heading', { name: 'Want to practice with people?' }))
    .toBeVisible();
  await expect.element(page.getByTestId('fluency-call-open-request')).toBeVisible();
  await expect.element(page.getByTestId('fluency-call-open-voice-chat')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Request a call' })).toBeVisible();

  const video = await box('muted-preview-video');
  const request = await box('fluency-call-request');
  expect(video.right).toBeLessThanOrEqual(request.left + 1);
  await holdVideoFrame();
  await expect
    .element(page.getByTestId('fluency-call-shot'))
    .toMatchScreenshot('request-beside-video');
});

test('a narrow card keeps the request inside the card', async () => {
  await renderCard({}, 320);

  const card = await box('fluency-call-card');
  const button = await box('fluency-call-open-request');
  const video = await box('muted-preview-video');
  const title = await page
    .getByRole('heading', { name: 'Want to practice with people?' })
    .element();

  expect(button.right).toBeLessThanOrEqual(card.right + 1);
  expect(button.left).toBeGreaterThanOrEqual(card.left);
  expect(video.bottom).toBeLessThanOrEqual(title.getBoundingClientRect().top + 1);
  await holdVideoFrame();
  await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('request-narrow');
});

test('a phone-width viewport shows the host video above the request', async () => {
  await page.viewport(390, 844);
  try {
    await renderCard({}, 360);

    const video = await box('muted-preview-video');
    const title = await page
      .getByRole('heading', { name: 'Want to practice with people?' })
      .element();
    const titleBox = title.getBoundingClientRect();

    expect(video.bottom).toBeLessThanOrEqual(titleBox.top + 1);
    expect(video.left).toBeGreaterThanOrEqual((await box('fluency-call-card')).left);
    await holdVideoFrame();
    await expect.element(page.getByTestId('fluency-call-shot')).toMatchScreenshot('request-phone');
  } finally {
    await page.viewport(1280, 900);
  }
});

test('open request form stays on the card and shows the request modal', async () => {
  await renderCard();

  await userEvent.click(page.getByTestId('fluency-call-open-request'));

  await expect.element(page.getByTestId('community-call-request-modal')).toBeVisible();
  await expect.element(page.getByTestId('community-call-form')).toBeVisible();
  await expect.element(page.getByText('No account needed', { exact: false })).not.toBeInTheDocument();
  await expect
    .element(page.getByText('Tell me what you want to practice, and how I can reach you.'))
    .toBeVisible();
  await expect
    .element(page.getByTestId('community-call-contact'))
    .toHaveAttribute('placeholder', 'Email, Telegram, Instagram, or WhatsApp');
  await expect.element(page.getByTestId('fluency-call-card')).toBeVisible();

  await userEvent.click(page.getByRole('button', { name: 'close' }));
  await expect.element(page.getByTestId('community-call-request-modal')).not.toBeInTheDocument();
});

test('open voice chat uses the card callback', async () => {
  const onOpenVoiceChat = vi.fn();
  await renderCard({ onOpenVoiceChat });
  await userEvent.click(page.getByTestId('fluency-call-open-voice-chat'));
  expect(onOpenVoiceChat).toHaveBeenCalledTimes(1);
});

test('the host intro uses the muted preview of the real video', async () => {
  await renderCard({
    welcomeVideoSrc: '/group_call/intro2.webm',
    onOpenVoiceChat: () => {},
  });

  const video = (await page.getByTestId('muted-preview-video').element()) as HTMLVideoElement;
  expect(video.getAttribute('src')).toBe('/group_call/intro2.webm');
  expect(video.muted).toBe(true);
  expect(video.loop).toBe(true);
  await expect.element(page.getByTestId('muted-preview-unmute')).toBeVisible();
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
