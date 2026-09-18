/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { PaymentAuthGate } from './PaymentAuthGate';

const mockUseAuth = jest.fn();

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/features/Auth/AuthWall', () => ({
  AuthWall: ({ children, signInTitle }: { children: ReactNode; signInTitle?: string }) => {
    const { useAuth } = jest.requireMock('@/features/Auth/useAuth') as {
      useAuth: () => { isIdentified: boolean };
    };
    if (!useAuth().isIdentified) {
      return <div>{signInTitle}</div>;
    }
    return children;
  },
}));

describe('PaymentAuthGate', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('asks guests to sign in before showing payment plans', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      isIdentified: false,
      isAnonymous: true,
      isAuthorized: true,
      uid: 'anon-1',
      signInWithGoogle: async () => ({ isDone: false, error: '' }),
      signInWithEmail: async () => ({ isDone: false, error: '' }),
    });

    render(
      <I18nWrapper>
        <PaymentAuthGate>
          <div>Plan picker</div>
        </PaymentAuthGate>
      </I18nWrapper>,
    );

    expect(screen.getByTestId('payment-auth-gate')).toBeInTheDocument();
    expect(screen.getByText('Sign in to subscribe')).toBeInTheDocument();
    expect(screen.queryByText('Plan picker')).not.toBeInTheDocument();
  });

  it('shows payment plans after Google or email sign-in', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      isIdentified: true,
      isAnonymous: false,
      isAuthorized: true,
      uid: 'user-1',
      signInWithGoogle: async () => ({ isDone: true, error: '' }),
      signInWithEmail: async () => ({ isDone: true, error: '' }),
    });

    render(
      <I18nWrapper>
        <PaymentAuthGate>
          <div>Plan picker</div>
        </PaymentAuthGate>
      </I18nWrapper>,
    );

    expect(screen.getByText('Plan picker')).toBeInTheDocument();
    expect(screen.queryByText('Sign in to subscribe')).not.toBeInTheDocument();
  });
});
