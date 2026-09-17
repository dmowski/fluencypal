/**
 * @jest-environment jsdom
 */

import type { ReactNode } from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { sendSpeechStart } from '@/features/Analytics/Custom/sendSpeechStart';
import { QuizGuestRecordAbout } from './QuizGuestRecordAbout';

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
    recorder.startRecording.mockReset();
    recorder.stopRecording.mockReset();
    recorder.isRecording = false;
    recorder.transcriptionBlob = null;
    recorder.error = '';
    recorder.recordingMilliSeconds = 0;
    recorder.visualizerComponent = null;
    (sendSpeechStart as jest.Mock).mockClear();
  });

  it('lets a guest record one answer and then marks them ready after it is saved', async () => {
    const onReadyToContinue = jest.fn();
    const onSaveRecording = jest.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <I18nWrapper>
        <QuizGuestRecordAbout
          languageCode="en"
          onSaveRecording={onSaveRecording}
          onReadyToContinue={onReadyToContinue}
        />
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
        <QuizGuestRecordAbout
          languageCode="en"
          onSaveRecording={onSaveRecording}
          onReadyToContinue={onReadyToContinue}
        />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('quiz-guest-about-loader')).toBeInTheDocument();
    expect(screen.queryByText('Sign in to get your personal plan')).not.toBeInTheDocument();
    expect(onReadyToContinue).not.toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(onSaveRecording).toHaveBeenCalledWith({
        languageCode: 'en',
        blob: recorder.transcriptionBlob,
        format: 'audio/webm',
        durationSec: 4,
      });
      expect(onReadyToContinue).toHaveBeenCalledWith(true);
    });

    expect(screen.getByTestId('quiz-guest-about-skeleton')).toBeInTheDocument();
    expect(screen.getByLabelText('You:')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-guest-about-loader')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in to get your personal plan')).not.toBeInTheDocument();
    expect(sendSpeechStart).toHaveBeenCalledWith('quiz');
    expect(screen.queryByTestId('quiz-guest-about-button')).not.toBeInTheDocument();
  });

  it('lets the guest retry when saving the answer fails', async () => {
    const onReadyToContinue = jest.fn();
    const onSaveRecording = jest.fn().mockRejectedValue(new Error('offline'));
    const { rerender } = render(
      <I18nWrapper>
        <QuizGuestRecordAbout
          languageCode="en"
          onSaveRecording={onSaveRecording}
          onReadyToContinue={onReadyToContinue}
        />
      </I18nWrapper>,
    );

    recorder.transcriptionBlob = new Blob(['audio'], { type: 'audio/webm' });
    recorder.recordingMilliSeconds = 4000;
    rerender(
      <I18nWrapper>
        <QuizGuestRecordAbout
          languageCode="en"
          onSaveRecording={onSaveRecording}
          onReadyToContinue={onReadyToContinue}
        />
      </I18nWrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Couldn't save your answer. Try recording again."),
      ).toBeInTheDocument();
    });
    expect(onReadyToContinue).not.toHaveBeenCalledWith(true);
    expect(screen.getByTestId('quiz-guest-about-button')).toBeInTheDocument();
    expect(sendSpeechStart).not.toHaveBeenCalled();
  });

  it('stops an in-progress recording', () => {
    recorder.isRecording = true;
    recorder.visualizerComponent = <div data-testid="voice-visualizer" />;
    render(
      <I18nWrapper>
        <QuizGuestRecordAbout languageCode="en" onSaveRecording={jest.fn()} />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('quiz-guest-about-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('voice-visualizer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(recorder.stopRecording).toHaveBeenCalled();
  });
});
