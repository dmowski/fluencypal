/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { CommunityCallOnboarding } from './CommunityCallOnboarding';
import { sendCommunityCallRequest } from './sendCommunityCallRequest';

jest.mock('./sendCommunityCallRequest', () => ({
  sendCommunityCallRequest: jest.fn(),
}));

const mockGetToken = jest.fn(async () => '');

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    getToken: () => mockGetToken(),
  }),
}));

const send = sendCommunityCallRequest as jest.Mock;

describe('CommunityCallOnboarding', () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue(undefined);
    mockGetToken.mockReset();
    mockGetToken.mockResolvedValue('');
  });

  it('sends interests and contact, then offers AI practice', async () => {
    render(
      <I18nWrapper>
        <CommunityCallOnboarding lang="en" />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('community-call-whats-next')).toHaveTextContent(
      'Group calls are free.',
    );
    expect(screen.getByText(/No account needed/)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('community-call-interests'), {
      target: { value: 'Travel, beginner' },
    });
    fireEvent.change(screen.getByTestId('community-call-contact'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.click(screen.getByTestId('community-call-submit'));

    expect(await screen.findByTestId('community-call-sent')).toBeInTheDocument();
    expect(screen.getByTestId('community-call-practice')).toHaveAttribute('href', '/practice');
    expect(send).toHaveBeenCalledWith('Travel, beginner', 'ada@example.com', undefined);
  });

  it('sends the signed-in account token with the request', async () => {
    mockGetToken.mockResolvedValue('signed-in-token');
    render(
      <I18nWrapper>
        <CommunityCallOnboarding lang="en" signedIn />
      </I18nWrapper>,
    );

    fireEvent.change(screen.getByTestId('community-call-interests'), {
      target: { value: 'c1, speaking' },
    });
    fireEvent.change(screen.getByTestId('community-call-contact'), {
      target: { value: 'WhatsApp 15873708005' },
    });
    fireEvent.click(screen.getByTestId('community-call-submit'));

    expect(await screen.findByTestId('community-call-sent')).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith('c1, speaking', 'WhatsApp 15873708005', 'signed-in-token');
  });

  it('keeps the form when the note cannot be sent', async () => {
    send.mockRejectedValue(new Error('offline'));
    render(
      <I18nWrapper>
        <CommunityCallOnboarding lang="ko" />
      </I18nWrapper>,
    );

    fireEvent.change(screen.getByTestId('community-call-interests'), {
      target: { value: 'Work' },
    });
    fireEvent.change(screen.getByTestId('community-call-contact'), {
      target: { value: '@ada' },
    });
    fireEvent.click(screen.getByTestId('community-call-submit'));

    expect(await screen.findByTestId('community-call-error')).toHaveTextContent(
      'Could not send that. Please try again.',
    );
    expect(screen.getByTestId('community-call-form')).toBeInTheDocument();
  });
});
