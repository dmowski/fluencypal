/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderWithI18n } from '@/features/Alias/test-utils/i18nTestHelper';
import { GroupConversationRequestForm } from './GroupConversationRequestForm';
import { sendGroupConversationRequest } from './sendGroupConversationRequest';

jest.mock('./sendGroupConversationRequest', () => ({
  sendGroupConversationRequest: jest.fn(),
}));

const send = sendGroupConversationRequest as jest.Mock;

describe('group conversation request form', () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue(undefined);
  });

  it('sends interests and contact from the feature page', async () => {
    render(renderWithI18n(<GroupConversationRequestForm lang="en" />));

    expect(screen.getByText('No account needed. Group calls are free.')).toBeInTheDocument();
    expect(screen.getByTestId('group-conversations-request-submit')).toHaveAttribute(
      'data-analytics',
      'community-call-request-submit',
    );
    expect(screen.getByTestId('group-conversations-interests')).toHaveValue(
      'Travel and daily conversations, intermediate',
    );
    fireEvent.change(screen.getByTestId('group-conversations-interests'), {
      target: { value: 'Travel, beginner' },
    });
    fireEvent.change(screen.getByTestId('group-conversations-contact'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.click(screen.getByTestId('group-conversations-request-submit'));

    expect(await screen.findByTestId('group-conversations-request-sent')).toBeInTheDocument();
    expect(screen.getByTestId('group-conversations-request-practice')).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/practice',
    );
    expect(screen.getByTestId('group-conversations-request-practice')).toHaveAttribute(
      'data-analytics',
      'community-call-practice',
    );
    expect(send).toHaveBeenCalledWith('Travel, beginner', 'ada@example.com');
  });

  it('sends the default interest when they only add a contact', async () => {
    render(renderWithI18n(<GroupConversationRequestForm lang="en" />));

    fireEvent.change(screen.getByTestId('group-conversations-interests'), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByTestId('group-conversations-contact'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.click(screen.getByTestId('group-conversations-request-submit'));

    expect(await screen.findByTestId('group-conversations-request-sent')).toBeInTheDocument();
    expect(send).toHaveBeenCalledWith(
      'Travel and daily conversations, intermediate',
      'ada@example.com',
    );
  });

  it('asks for a contact before sending', () => {
    render(renderWithI18n(<GroupConversationRequestForm lang="en" />));

    fireEvent.submit(screen.getByTestId('group-conversations-request-form'));

    expect(screen.getByTestId('group-conversations-request-error')).toHaveTextContent(
      'Add an email, Telegram, Instagram, or WhatsApp.',
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('keeps the form when the note cannot be sent', async () => {
    send.mockRejectedValue(new Error('offline'));
    render(renderWithI18n(<GroupConversationRequestForm lang="ko" />));

    fireEvent.change(screen.getByTestId('group-conversations-interests'), {
      target: { value: 'Work' },
    });
    fireEvent.change(screen.getByTestId('group-conversations-contact'), {
      target: { value: '@ada' },
    });
    fireEvent.click(screen.getByTestId('group-conversations-request-submit'));

    expect(await screen.findByTestId('group-conversations-request-error')).toHaveTextContent(
      'Could not send that. Please try again.',
    );
    expect(screen.getByTestId('group-conversations-request-form')).toBeInTheDocument();
  });
});
