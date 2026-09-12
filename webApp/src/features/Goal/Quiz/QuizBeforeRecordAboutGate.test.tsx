/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
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
  QuizRecordAboutPrompt: ({ text }: { text: string }) => (
    <div data-testid="quiz-record-about-prompt">{text}</div>
  ),
}));

describe('QuizBeforeRecordAboutGate', () => {
  beforeEach(() => {
    authState.uid = '';
    authState.loading = false;
    window.localStorage.clear();
    resetGuestAboutForTests();
  });

  it('asks the guest to record before showing Google', () => {
    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate
          languageCode="en"
          promptText="Tell me about yourself. Why do you want to practice speaking?"
          onSignedIn={jest.fn()}
        />
      </I18nWrapper>,
    );

    expect(screen.getByText('Tell me about yourself')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-record-about-prompt')).toHaveTextContent(
      'Tell me about yourself. Why do you want to practice speaking?',
    );
    expect(screen.getByTestId('quiz-guest-about-button')).toHaveAttribute(
      'data-analytics',
      'record-about-guest',
    );
    expect(screen.queryByRole('button', { name: 'Continue to talk' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'I agree' })).not.toBeInTheDocument();
  });

  it('shows Continue to talk after the guest records', () => {
    saveGuestAboutRecording({
      languageCode: 'en',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate
          languageCode="en"
          promptText="Tell me about yourself."
          onSignedIn={jest.fn()}
        />
      </I18nWrapper>,
    );

    expect(screen.getByText('Sign in to get your personal plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue to talk' })).toHaveAttribute(
      'data-analytics',
      'auth-google',
    );
    expect(screen.getByRole('button', { name: 'Sign in with email' })).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-guest-about-button')).not.toBeInTheDocument();
  });

  it('does not advance while auth is still loading', () => {
    authState.loading = true;
    const onSignedIn = jest.fn();

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate
          languageCode="en"
          promptText="Tell me about yourself."
          onSignedIn={onSignedIn}
        />
      </I18nWrapper>,
    );

    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('advances to recordAbout after identify', async () => {
    authState.uid = 'user-1';
    const onSignedIn = jest.fn();

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate
          languageCode="en"
          promptText="Tell me about yourself."
          onSignedIn={onSignedIn}
        />
      </I18nWrapper>,
    );

    await waitFor(() => {
      expect(onSignedIn).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('button', { name: 'Continue to talk' })).not.toBeInTheDocument();
  });
});
