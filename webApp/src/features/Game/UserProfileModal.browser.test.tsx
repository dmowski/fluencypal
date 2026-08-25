import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { UserProfileModal } from './UserProfileModal';

const ME_USER_ID = 'user-me';
const OTHER_USER_ID = 'user-other';
const AVATAR_URL = '/gameAvatar/42cda3b0-7a12-47b1-a3a3-a093935f55c2.webp';

vi.mock('@/features/Game/useGame', () => ({
  useGame: () => ({
    myUserName: 'Alex',
    myAvatar: AVATAR_URL,
    userNames: {
      [ME_USER_ID]: 'Alex',
      [OTHER_USER_ID]: 'Sam',
    },
    gameAvatars: {
      [ME_USER_ID]: AVATAR_URL,
      [OTHER_USER_ID]: AVATAR_URL,
    },
    gameLastVisit: {},
    userAchievements: {},
    getRealPosition: () => 0,
    updateUsername: async () => undefined,
    setAvatar: () => undefined,
    isLoading: false,
  }),
}));

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: ME_USER_ID,
    isFounder: false,
    userInfo: { photoURL: '' },
  }),
}));

vi.mock('@/features/Game/Battle/useBattle', () => ({
  useBattle: () => ({
    battles: [],
    createBattleWithUser: async () => undefined,
  }),
}));

vi.mock('@/features/Usage/useAccess', () => ({
  useAccess: () => ({}),
}));

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('@/features/Url/useUrlParam', () => ({
  useUrlParam: () => [false, vi.fn(), false],
}));

vi.mock('@/features/Chat/UsersPrivateChat', () => ({
  UsersPrivateChat: () => null,
}));

vi.mock('@/features/Game/UploadImageButton', () => ({
  UploadImageButton: () => null,
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockNextImage({ src, alt }: { src: string; alt: string }) {
    return <img src={src} alt={alt} />;
  },
}));

test('own profile lets the user edit username and avatar', async () => {
  await render(
    <BrowserAppShell>
      <UserProfileModal stat={{ userId: ME_USER_ID, points: 120 }} onClose={() => undefined} />
    </BrowserAppShell>,
  );

  await expect.element(page.getByTestId('game-my-identity')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Edit username' })).toBeVisible();
  await expect.element(page.getByText('Alex')).toBeVisible();
});

test('another user profile is read-only', async () => {
  await render(
    <BrowserAppShell>
      <UserProfileModal stat={{ userId: OTHER_USER_ID, points: 80 }} onClose={() => undefined} />
    </BrowserAppShell>,
  );

  await expect.element(page.getByText('Sam')).toBeVisible();
  await expect.element(page.getByTestId('game-my-identity')).not.toBeInTheDocument();
  await expect.element(page.getByRole('button', { name: 'Edit username' })).not.toBeInTheDocument();
});
