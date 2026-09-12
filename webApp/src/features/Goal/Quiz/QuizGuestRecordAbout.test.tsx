/**
 * @jest-environment jsdom
 */

import type { ReactNode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { sendSpeechStart } from '@/features/Analytics/Custom/sendSpeechStart';
import { QUIZ_GUEST_SIGN_IN_DELAY_MS, QuizGuestRecordAbout } from './QuizGuestRecordAbout';
import { hasGuestAbout, resetGuestAboutForTests } from './quizGuestAboutStorage';

const recorder = {
  startRecording: jest.fn(),
  stopRecording: jest.fn(),
  isRecording: false,
  isTranscribing: false,
  transcriptionBlob: null as Blob | null,
  error: '',
  visualizerComponent: null as ReactNode,
  recordingMilliSeconds: 0,
};

jest.mock('@/features/Audio/useAudioRecorder', () => ({
  useAudioRecorder: () => recorder,
}));

jest.mock('@/features/Analytics/Custom/sendSpeechStart', () => ({
  sendSpeechStart: jest.fn(),
}));

describe('QuizGuestRecordAbout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetGuestAboutForTests();
    recorder.startRecording.mockReset();
    recorder.stopRecording.mockReset();
    recorder.isRecording = false;
    recorder.transcriptionBlob = null;
    recorder.error = '';
    recorder.recordingMilliSeconds = 0;
    recorder.visualizerComponent = null;
    (sendSpeechStart as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lets a guest record one answer and then asks them to sign in', async () => {
    const onReadyForSignIn = jest.fn();
    const { rerender } = render(
      <I18nWrapper>
        <QuizGuestRecordAbout languageCode="en" onReadyForSignIn={onReadyForSignIn} />
      </I18nWrapper>,
    );

    const replyButton = screen.getByTestId('quiz-guest-about-button');
    expect(replyButton).toHaveAttribute('data-analytics', 'record-about-guest');
    fireEvent.click(replyButton);
    expect(recorder.startRecording).toHaveBeenCalled();

    recorder.transcriptionBlob = new Blob(['audio'], { type: 'audio/webm' });
    recorder.recordingMilliSeconds = 4000;
    rerender(
      <I18nWrapper>
        <QuizGuestRecordAbout languageCode="en" onReadyForSignIn={onReadyForSignIn} />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('quiz-guest-about-loader')).toBeInTheDocument();
    expect(screen.queryByText('Sign in to get your personal plan')).not.toBeInTheDocument();
    expect(onReadyForSignIn).not.toHaveBeenCalledWith(true);

    act(() => {
      jest.advanceTimersByTime(QUIZ_GUEST_SIGN_IN_DELAY_MS);
    });

    expect(screen.getByText('Sign in to get your personal plan')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-guest-about-skeleton')).toBeInTheDocument();
    expect(screen.getByLabelText('You:')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-guest-about-loader')).not.toBeInTheDocument();
    expect(onReadyForSignIn).toHaveBeenCalledWith(true);
    expect(sendSpeechStart).toHaveBeenCalledWith('quiz');
    expect(hasGuestAbout('en')).toBe(true);
    expect(screen.queryByTestId('quiz-guest-about-button')).not.toBeInTheDocument();
  });

  it('stops an in-progress recording', () => {
    recorder.isRecording = true;
    recorder.visualizerComponent = <div data-testid="voice-visualizer" />;
    render(
      <I18nWrapper>
        <QuizGuestRecordAbout languageCode="en" />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('quiz-guest-about-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('voice-visualizer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(recorder.stopRecording).toHaveBeenCalled();
  });
});
