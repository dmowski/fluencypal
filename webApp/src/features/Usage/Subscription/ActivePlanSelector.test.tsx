/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { ActivePlanSelector } from './ActivePlanSelector';

jest.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertPrice: (amount: number) => `$${amount}`,
    convertUsdToCurrency: (amount: number) => `$${amount}`,
  }),
}));

describe('ActivePlanSelector', () => {
  it('shows the selected month plan', () => {
    render(
      <I18nWrapper>
        <ActivePlanSelector
          selectedDuration="month"
          setSelectedDuration={() => undefined}
          onSelectDuration={() => undefined}
        />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('subscription-duration-day')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId('subscription-duration-month')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Unlock for 1 month' })).toBeInTheDocument();
  });

  it('shows 1 day when that plan is selected', () => {
    render(
      <I18nWrapper>
        <ActivePlanSelector
          selectedDuration="day"
          setSelectedDuration={() => undefined}
          onSelectDuration={() => undefined}
        />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('subscription-duration-day')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Unlock for 1 day' })).toBeInTheDocument();
  });
});
