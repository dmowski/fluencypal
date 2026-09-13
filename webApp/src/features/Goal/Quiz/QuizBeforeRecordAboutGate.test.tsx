/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { QuizBeforeRecordAboutGate } from './QuizBeforeRecordAboutGate';
import { resetGuestAboutForTests, saveGuestAboutRecording } from './quizGuestAboutStorage';

const authState = {
  uid: '',
  loading: false,
  userInfo: null,
  signInWithGoogle: jest.fn(),
  signInWithEmail: jest.fn(),
};

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => authState,
}));

jest.mock('@/features/Audio/useAudioRecorder', () => ({
  useAudioRecorder: () => ({
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    isRecording: false,
    isTranscribing: false,
    transcriptionBlob: null,
    error: '',
    visualizerComponent: null,
    recordingMilliSeconds: 0,
  }),
}));

jest.mock('@/features/Auth/useIsWebView', () => ({
  useIsWebView: () => ({
    inWebView: false,
    isAndroid: false,
    isTelegram: false,
  }),
}));

jest.mock('@/features/Survey/ColorIconTextList', () => ({
  ColorIconTextList: () => null,
}));

jest.mock('./QuizRecordAboutPrompt', () => ({
  QuizRecordAboutPrompt: ({
    text,
    variant = 'question',
  }: {
    text: string;
    variant?: 'question' | 'reaction';
  }) => (
    <div data-testid="quiz-record-about-prompt" data-variant={variant}>
      {text}
    </div>
  ),
}));

const gateProps = {
  languageCode: 'en',
  title: 'Why do you want to practice speaking?',
  subTitle: "I'll use your answer to make your personal plan.",
  promptText:
    "Why do you want to practice speaking? I'll use your answer to make your personal plan.",
};

describe('QuizBeforeRecordAboutGate', () => {
  beforeEach(() => {
    authState.uid = '';
    authState.loading = false;
    window.localStorage.clear();
    resetGuestAboutForTests();
  });

  it('asks the guest to record before showing Continue', () => {
    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate {...gateProps} onContinue={jest.fn()} />
      </I18nWrapper>,
    );

    expect(screen.getByRole('heading', { name: 'Why do you want to practice speaking?' })).toBeInTheDocument();
    expect(screen.getByText("I'll use your answer to make your personal plan.")).toBeInTheDocument();
    expect(screen.getByTestId('quiz-record-about-prompt')).toHaveTextContent(
      "Why do you want to practice speaking? I'll use your answer to make your personal plan.",
    );
    expect(screen.getByTestId('quiz-guest-about-button')).toHaveAttribute(
      'data-analytics',
      'record-about-guest',
    );
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue to talk' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'I agree' })).not.toBeInTheDocument();
  });

  it('plays a teacher reaction and Continue after the guest records', () => {
    const onContinue = jest.fn();
    saveGuestAboutRecording({
      languageCode: 'en',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate {...gateProps} onContinue={onContinue} />
      </I18nWrapper>,
    );

    expect(
      screen.getByText("Thanks — I'll use that to make your plan. Let's keep going."),
    ).toBeInTheDocument();
    expect(screen.getByTestId('quiz-record-about-prompt')).toHaveAttribute('data-variant', 'reaction');
    expect(
      screen.queryByText(
        "Why do you want to practice speaking? I'll use your answer to make your personal plan.",
      ),
    ).not.toBeInTheDocument();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toHaveAttribute('data-analytics', 'quiz-guest-continue');
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in to get your personal plan')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quiz-guest-about-button')).not.toBeInTheDocument();

    fireEvent.click(continueButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('does not advance while auth is still loading', () => {
    authState.loading = true;
    const onContinue = jest.fn();

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate {...gateProps} onContinue={onContinue} />
      </I18nWrapper>,
    );

    expect(onContinue).not.toHaveBeenCalled();
  });

  it('advances after identify', async () => {
    authState.uid = 'user-1';
    const onContinue = jest.fn();

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate {...gateProps} onContinue={onContinue} />
      </I18nWrapper>,
    );

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });
});
