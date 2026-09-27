/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { DayPassConfirm } from './DayPassConfirm';

jest.mock('@/features/User/useCurrency', () => ({
  useCurrency: () => ({
    currency: 'USD',
    convertUsdToCurrency: () => '$1.10',
  }),
}));

jest.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({ userSettings: { pageLanguageCode: 'en' } }),
}));

jest.mock('@/features/Auth/AuthWall', () => ({
  AuthWall: ({ signInTitle }: { signInTitle?: string }) => <div>{signInTitle}</div>,
}));

const lesson = {
  title: 'Greetings',
  details: 'Words for saying hello.',
};

const renderConfirm = (isIdentified: boolean, onConfirm = jest.fn()) => {
  render(
    <I18nWrapper>
      <DayPassConfirm
        lesson={lesson}
        accessLine="Full access until 28 September. (1 day)"
        amountInUsd={1.1}
        isIdentified={isIdentified}
        isRedirecting={false}
        onConfirm={onConfirm}
      />
    </I18nWrapper>,
  );
  return onConfirm;
};

const checkBothBoxes = () => {
  for (const box of screen.getAllByRole('checkbox')) {
    fireEvent.click(box);
  }
};

describe('DayPassConfirm', () => {
  it('shows the next lesson and sign-in together, and does not start checkout for a guest', () => {
    const onConfirm = renderConfirm(false);

    expect(screen.getByRole('heading', { name: 'Greetings' })).toBeInTheDocument();
    expect(screen.getByText('Words for saying hello.')).toBeInTheDocument();
    expect(screen.getByText('Full access until 28 September. (1 day)')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue this lesson')).toBeInTheDocument();

    checkBothBoxes();
    const order = screen.getByRole('button', { name: /Order with obligation to pay/ });
    expect(order).toBeDisabled();
    fireEvent.click(order);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('starts checkout only after the checkboxes when they are already signed in', () => {
    const onConfirm = renderConfirm(true);

    expect(screen.queryByText('Sign in to continue this lesson')).not.toBeInTheDocument();
    const order = screen.getByRole('button', { name: /Order with obligation to pay \$1\.10/ });
    expect(order).toBeDisabled();

    checkBothBoxes();
    expect(order).toBeEnabled();
    fireEvent.click(order);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
