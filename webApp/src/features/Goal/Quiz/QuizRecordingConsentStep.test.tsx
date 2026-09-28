/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { requestMicrophoneAccess } from '@/libs/mic';
import { sendPermission, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';
import { QuizMicPermissionStep, QuizRecordingConsentStep } from './QuizRecordingConsentStep';

jest.mock('@/libs/mic', () => ({
  requestMicrophoneAccess: jest.fn(),
}));

jest.mock('@/features/Analytics/Custom/sendOutcomeEvents', () => ({
  sendPermission: jest.fn(),
  sendUiError: jest.fn(),
}));

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'anon-1',
    loading: false,
    isIdentified: false,
    userInfo: null,
  }),
}));

jest.mock('@/features/Survey/ColorIconTextList', () => ({
  ColorIconTextList: ({ listItems }: { listItems: { title: string; href?: string }[] }) => (
    <ul>
      {listItems.map((item) => (
        <li key={item.title}>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</li>
      ))}
    </ul>
  ),
}));

const requestMicrophoneAccessMock = requestMicrophoneAccess as jest.MockedFunction<
  typeof requestMicrophoneAccess
>;

describe('QuizRecordingConsentStep', () => {
  it('states the age and links the policies without asking for the microphone', () => {
    const onContinue = jest.fn();
    render(
      <I18nWrapper>
        <QuizRecordingConsentStep pageLanguage="en" onContinue={onContinue} isStepLoading={false} />
      </I18nWrapper>,
    );

    expect(screen.getByText('Before you record your voice')).toBeInTheDocument();
    expect(screen.getByText('You confirm that you are at least 13 years old')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://www.fluencypal.com/privacy',
    );
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      'https://www.fluencypal.com/terms',
    );
    fireEvent.click(screen.getByRole('button', { name: 'I agree' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(requestMicrophoneAccessMock).not.toHaveBeenCalled();
  });
});

describe('QuizMicPermissionStep', () => {
  beforeEach(() => {
    requestMicrophoneAccessMock.mockReset();
    (sendPermission as jest.Mock).mockClear();
    (sendUiError as jest.Mock).mockClear();
  });

  it('asks the browser for the microphone', async () => {
    const onContinue = jest.fn();
    requestMicrophoneAccessMock.mockResolvedValue(true);

    render(
      <I18nWrapper>
        <QuizMicPermissionStep onContinue={onContinue} isStepLoading={false} />
      </I18nWrapper>,
    );

    const allow = screen.getByRole('button', { name: 'Allow microphone' });
    expect(allow).toHaveAttribute('data-analytics', 'mic-permission-grant');
    fireEvent.click(allow);

    await waitFor(() => {
      expect(sendPermission).toHaveBeenCalledWith({ kind: 'mic', state: 'prompt' });
      expect(requestMicrophoneAccessMock).toHaveBeenCalledTimes(1);
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('quiz-mic-denied')).not.toBeInTheDocument();
    expect(sendUiError).not.toHaveBeenCalled();
  });

  it('stays on the step with settings help if access is blocked', async () => {
    const onContinue = jest.fn();
    requestMicrophoneAccessMock.mockResolvedValue(false);

    render(
      <I18nWrapper>
        <QuizMicPermissionStep onContinue={onContinue} isStepLoading={false} />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Allow microphone' }));

    await waitFor(() => {
      expect(screen.getByTestId('quiz-mic-denied')).toBeInTheDocument();
    });
    expect(onContinue).not.toHaveBeenCalled();
    expect(sendUiError).toHaveBeenCalledWith('mic_denied');
  });
});
