/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { EmailLinkConfirmForm } from './EmailLinkConfirmForm';

describe('EmailLinkConfirmForm', () => {
  it('asks again when the address does not match the link', async () => {
    const onConfirm = jest.fn(async () => ({ isDone: false, error: 'mismatch' }));
    render(
      <I18nWrapper>
        <EmailLinkConfirmForm onConfirm={onConfirm} />
      </I18nWrapper>,
    );

    fireEvent.change(screen.getByTestId('email-link-confirm-email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.click(screen.getByTestId('email-link-confirm-submit'));

    expect(
      await screen.findByText('That email does not match this link, or the link has expired.'),
    ).toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledWith('ada@example.com');
    expect(screen.getByTestId('email-link-confirm')).toBeInTheDocument();
  });
});
