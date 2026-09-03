/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { RolePlayInstruction } from '@/features/RolePlay/types';
import { RolePlayScenariosInfo } from '@/features/RolePlay/rolePlayData';
import { SignInForm } from './SignInForm';

const searchParams: Record<string, string | null> = {
  rolePlayId: null,
  goalId: null,
};

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => searchParams[key] ?? null,
  }),
}));

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: '',
    loading: false,
    userInfo: null,
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
  }),
}));

jest.mock('@/features/Auth/useIsWebView', () => ({
  useIsWebView: () => ({
    inWebView: false,
    isAndroid: false,
    isTelegram: false,
  }),
}));

jest.mock('@/features/Survey/ColorIconTextList', () => ({
  ColorIconTextList: () => null,
}));

const aliasOpening =
  "Hello, I'm your AI partner for the Alias game. I'm ready to guess your word. Please describe it to me.";

const aliasScenario = {
  id: 'alias-game',
  title: 'Alias Word Guessing Game',
  shortTitle: 'Alias',
  subTitle: 'Practice vocabulary by creatively describing and guessing words',
  exampleOfFirstMessageFromAi: aliasOpening,
  voice: 'shimmer',
} as RolePlayInstruction;

const hotelOpening =
  'Good afternoon. Welcome to the Grand Skyline Hotel. My name is Onyx. Are you checking in today?';

const hotelScenario = {
  id: 'hotel-check-in',
  title: 'Hotel Check-In',
  shortTitle: 'Hotel Check-In',
  subTitle: 'Practice checking in at a hotel',
  exampleOfFirstMessageFromAi: hotelOpening,
  voice: 'verse',
} as RolePlayInstruction;

const rolePlayInfo: RolePlayScenariosInfo = {
  rolePlayScenarios: [aliasScenario, hotelScenario],
  categoriesList: [],
  allCategory: { categoryId: 'all', categoryTitle: 'All', isAllResources: true },
};

describe('SignInForm', () => {
  beforeEach(() => {
    searchParams.rolePlayId = null;
    searchParams.goalId = null;
    window.localStorage.clear();
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: jest.fn(),
    });
  });

  it('puts Google sign-in first with Alias copy after a Play CTA', () => {
    searchParams.rolePlayId = 'alias-game';

    render(
      <I18nWrapper>
        <SignInForm rolePlayInfo={rolePlayInfo} lang="en" />
      </I18nWrapper>,
    );

    expect(screen.getByText('Alias')).toBeInTheDocument();
    expect(
      screen.getByText('Practice vocabulary by creatively describing and guessing words'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Teacher:')).not.toBeInTheDocument();
    expect(screen.getByTestId('roleplay-opening-preview')).toBeInTheDocument();
    expect(screen.getByText(aliasOpening)).toBeInTheDocument();
    expect(screen.getByTestId('roleplay-opening-audio')).toHaveAttribute(
      'src',
      '/audio/role-openings/alias-game.mp3',
    );
    expect(screen.getByRole('button', { name: 'Hear the first line' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to talk' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'I agree' })).not.toBeInTheDocument();
  });

  it('uses the scenario short title for other role-play CTAs', () => {
    searchParams.rolePlayId = 'hotel-check-in';

    render(
      <I18nWrapper>
        <SignInForm rolePlayInfo={rolePlayInfo} lang="en" />
      </I18nWrapper>,
    );

    expect(screen.getByText('Hotel Check-In')).toBeInTheDocument();
    expect(screen.getByText('Practice checking in at a hotel')).toBeInTheDocument();
    expect(screen.getByText(hotelOpening)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to talk' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('keeps the features intro on generic practice', () => {
    render(
      <I18nWrapper>
        <SignInForm rolePlayInfo={rolePlayInfo} lang="en" />
      </I18nWrapper>,
    );

    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('roleplay-opening-preview')).not.toBeInTheDocument();
  });
});
