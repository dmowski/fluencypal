/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { sendFeedbackMessageRequest } from '@/app/api/telegram/sendFeedbackMessageRequest';
import { TalkWithAlexRequest } from './TalkWithAlexRequest';

jest.mock('@/app/api/telegram/sendFeedbackMessageRequest', () => ({
  sendFeedbackMessageRequest: jest.fn(),
}));

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    userInfo: { email: 'ada@example.com' },
    getToken: async () => 'token-1',
  }),
}));

const send = sendFeedbackMessageRequest as jest.Mock;

describe('TalkWithAlexRequest', () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ error: '' });
  });

  it('sends the contact to Telegram and shows that Alex will write', async () => {
    render(
      <I18nWrapper>
        <TalkWithAlexRequest lang="en" />
      </I18nWrapper>,
    );

    fireEvent.change(screen.getByTestId('talk-with-alex-note'), {
      target: { value: 'I am a beginner' },
    });
    fireEvent.click(screen.getByTestId('talk-with-alex-submit'));

    expect(await screen.findByTestId('talk-with-alex-sent')).toBeInTheDocument();
    expect(screen.getByTestId('talk-with-alex-continue')).toHaveAttribute('href', '/practice');
    expect(send).toHaveBeenCalledWith(
      {
        message: [
          'Talk with Alex',
          '',
          'They want a short call to get to know each other.',
          'Contact: ada@example.com',
          'About them: I am a beginner',
        ].join('\n'),
      },
      'token-1',
    );
  });

  it('keeps the form when Telegram fails', async () => {
    send.mockRejectedValue(new Error('offline'));
    render(
      <I18nWrapper>
        <TalkWithAlexRequest lang="en" />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByTestId('talk-with-alex-submit'));

    expect(await screen.findByText('Could not send that. Please try again.')).toBeInTheDocument();
    expect(screen.getByTestId('talk-with-alex-form')).toBeInTheDocument();
  });
});
