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

const aliasScenario = {
  id: 'alias-game',
  title: 'Alias Word Guessing Game',
  shortTitle: 'Alias',
  subTitle: 'Practice vocabulary by creatively describing and guessing words',
} as RolePlayInstruction;

const hotelScenario = {
  id: 'hotel-check-in',
  title: 'Hotel Check-In',
  shortTitle: 'Hotel Check-In',
  subTitle: 'Practice checking in at a hotel',
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
  });

  it('puts Google sign-in first with Alias copy after a Play CTA', () => {
    searchParams.rolePlayId = 'alias-game';

    render(
      <I18nWrapper>
        <SignInForm rolePlayInfo={rolePlayInfo} lang="en" />
      </I18nWrapper>,
    );

    expect(screen.getByText('Sign in to play Alias')).toBeInTheDocument();
    expect(screen.getByText("You'll return to this game after you sign in")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
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

    expect(screen.getByText('Sign in to start Hotel Check-In')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
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
  });
});
