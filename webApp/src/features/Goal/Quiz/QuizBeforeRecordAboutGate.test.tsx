/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { QuizBeforeRecordAboutGate } from './QuizBeforeRecordAboutGate';

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: '',
    loading: false,
    isIdentified: false,
    userInfo: null,
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
  }),
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

const recordAboutSubTitle =
  "I'll use your answer to make your personal plan. Please say two or three sentences, not just that you want to get better. Who do you talk to, and what feels hard when you speak?";

const gateProps = {
  languageCode: 'en',
  title: 'Why do you want to practice speaking?',
  subTitle: recordAboutSubTitle,
  promptText: `Why do you want to practice speaking? ${recordAboutSubTitle}`,
};

describe('QuizBeforeRecordAboutGate', () => {
  it('asks to record before showing Continue', () => {
    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate
          {...gateProps}
          onSaveRecording={jest.fn()}
          onContinue={jest.fn()}
        />
      </I18nWrapper>,
    );

    expect(
      screen.getByRole('heading', { name: 'Why do you want to practice speaking?' }),
    ).toBeInTheDocument();
    expect(screen.getByText(recordAboutSubTitle)).toBeInTheDocument();
    expect(screen.getByTestId('quiz-guest-about-button')).toHaveAttribute(
      'data-analytics',
      'record-about-guest',
    );
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in with Google' })).not.toBeInTheDocument();
  });

  it('plays a teacher reaction and Continue after a clip is saved', () => {
    const onContinue = jest.fn();

    render(
      <I18nWrapper>
        <QuizBeforeRecordAboutGate
          {...gateProps}
          alreadySaved
          onSaveRecording={jest.fn()}
          onContinue={onContinue}
        />
      </I18nWrapper>,
    );

    expect(
      screen.getByText("Thanks — I'll use that to make your plan. Let's keep going."),
    ).toBeInTheDocument();
    expect(screen.getByTestId('quiz-record-about-prompt')).toHaveAttribute(
      'data-variant',
      'reaction',
    );
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toHaveAttribute('data-analytics', 'quiz-guest-continue');
    expect(screen.queryByTestId('quiz-guest-about-button')).not.toBeInTheDocument();

    fireEvent.click(continueButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
