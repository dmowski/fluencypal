/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { requestMicrophoneAccess } from '@/libs/mic';
import { sendPermission, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';
import { QuizMicPermissionStep } from './QuizMicPermissionStep';

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
  ColorIconTextList: ({ listItems }: { listItems: { title: string }[] }) => (
    <ul>
      {listItems.map((item) => (
        <li key={item.title}>{item.title}</li>
      ))}
    </ul>
  ),
}));

const requestMicrophoneAccessMock = requestMicrophoneAccess as jest.MockedFunction<
  typeof requestMicrophoneAccess
>;

describe('QuizMicPermissionStep', () => {
  beforeEach(() => {
    requestMicrophoneAccessMock.mockReset();
    (sendPermission as jest.Mock).mockClear();
    (sendUiError as jest.Mock).mockClear();
  });

  it('explains why the microphone is needed before asking the browser', () => {
    render(
      <I18nWrapper>
        <QuizMicPermissionStep onContinue={jest.fn()} isStepLoading={false} />
      </I18nWrapper>,
    );

    expect(screen.getByText('Allow your microphone')).toBeInTheDocument();
    expect(
      screen.getByText('So you can speak your answer and talk with the teacher'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('You will record a short answer about why you want to practice'),
    ).toBeInTheDocument();
    expect(screen.getByText('Your browser will ask for permission. Tap Allow')).toBeInTheDocument();
    const grantButton = screen.getByRole('button', { name: 'Allow microphone' });
    expect(grantButton).toHaveAttribute('data-analytics', 'mic-permission-grant');
    expect(requestMicrophoneAccessMock).not.toHaveBeenCalled();
  });

  it('advances after the browser grants access', async () => {
    const onContinue = jest.fn();
    requestMicrophoneAccessMock.mockResolvedValue(true);

    render(
      <I18nWrapper>
        <QuizMicPermissionStep onContinue={onContinue} isStepLoading={false} />
      </I18nWrapper>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Allow microphone' }));

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
    expect(
      screen.getByText(
        'Microphone access was blocked. Open your browser settings, allow microphone access for this site, then tap Allow microphone again.',
      ),
    ).toBeInTheDocument();
  });
});
