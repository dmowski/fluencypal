/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { PaidAccessChooser } from './PaidAccessChooser';

jest.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertPrice: (amount: number) => `$${amount}`,
    convertUsdToCurrency: (amount: number) => `$${amount}`,
  }),
}));

describe('PaidAccessChooser', () => {
  it('shows week, month, and year with the three month prices', () => {
    render(
      <I18nWrapper>
        <PaidAccessChooser
          selectedDuration="month"
          setSelectedDuration={() => undefined}
          selectedPlan="practice"
          setSelectedPlan={() => undefined}
          onContinue={() => undefined}
        />
      </I18nWrapper>,
    );

    expect(screen.queryByTestId('subscription-duration-day')).not.toBeInTheDocument();
    expect(screen.getByTestId('subscription-duration-month')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('paid-access-plan-practice')).toHaveTextContent('$6');
    expect(screen.getByTestId('paid-access-plan-conversation')).toHaveTextContent('$14');
    expect(screen.getByTestId('paid-access-plan-conversation-10')).toHaveTextContent('$64');
    expect(screen.getAllByRole('button', { name: 'Continue' })).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Practice' })).toBeChecked();
  });

  it('shows the week prices when that period is selected', () => {
    render(
      <I18nWrapper>
        <PaidAccessChooser
          selectedDuration="week"
          setSelectedDuration={() => undefined}
          selectedPlan="conversation"
          setSelectedPlan={() => undefined}
          onContinue={() => undefined}
        />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('subscription-duration-week')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('paid-access-plan-practice')).toHaveTextContent('$3');
    expect(screen.getByTestId('paid-access-plan-conversation')).toHaveTextContent('30 minutes');
  });

  it('continues with the selected plan', () => {
    const onContinue = jest.fn();
    const setSelectedPlan = jest.fn();
    render(
      <I18nWrapper>
        <PaidAccessChooser
          selectedDuration="month"
          setSelectedDuration={() => undefined}
          selectedPlan="practice"
          setSelectedPlan={setSelectedPlan}
          onContinue={onContinue}
        />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Conversation 10' }));
    fireEvent.click(screen.getByTestId('paid-access-continue'));

    expect(setSelectedPlan).toHaveBeenCalledWith('conversation-10');
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
