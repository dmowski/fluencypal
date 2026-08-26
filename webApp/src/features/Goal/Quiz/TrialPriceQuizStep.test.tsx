/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { TrialPriceQuizStep } from './TrialPriceQuizStep';

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    userInfo: { displayName: 'Ada' },
    uid: 'user-1',
  }),
}));

jest.mock('@/features/Survey/ColorIconTextList', () => ({
  ColorIconTextList: () => null,
}));

jest.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertUsdToCurrency: (amount: number) => `$${amount}`,
    convertPrice: (amount: number) => amount,
  }),
}));

describe('TrialPriceQuizStep', () => {
  it('shows monthly price, trial badge, and refund info when trial days are set', () => {
    render(
      <I18nWrapper>
        <TrialPriceQuizStep next={() => undefined} trialDays={1} pricePerMonthUsd={8} />
      </I18nWrapper>,
    );

    expect(screen.getByText('$8')).toBeInTheDocument();
    expect(screen.getByText('per month')).toBeInTheDocument();
    expect(screen.getByTestId('trial-price-badge')).toHaveTextContent(
      '1-day trial with full access',
    );
    expect(
      screen.getByText('Refund anytime from Profile. Automatic, no time limit.'),
    ).toBeInTheDocument();
  });

  it('hides the trial badge when trial days are zero', () => {
    render(
      <I18nWrapper>
        <TrialPriceQuizStep next={() => undefined} trialDays={0} pricePerMonthUsd={8} />
      </I18nWrapper>,
    );

    expect(screen.queryByTestId('trial-price-badge')).not.toBeInTheDocument();
    expect(screen.getByText('$8')).toBeInTheDocument();
  });
});
