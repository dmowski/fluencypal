/**
 * @jest-environment jsdom
 */

import type { ReactNode } from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { RolePlayGuestReply } from './RolePlayGuestReply';
import { hasGuestReply, resetGuestReplyForTests } from './rolePlayGuestReplyStorage';
import { sendSpeechStart } from '@/features/Analytics/Custom/sendSpeechStart';

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

describe('RolePlayGuestReply', () => {
  beforeEach(() => {
    resetGuestReplyForTests();
    recorder.startRecording.mockReset();
    recorder.stopRecording.mockReset();
    recorder.isRecording = false;
    recorder.transcriptionBlob = null;
    recorder.error = '';
    recorder.recordingMilliSeconds = 0;
    recorder.visualizerComponent = null;
    (sendSpeechStart as jest.Mock).mockClear();
  });

  it('lets a guest record one reply and then asks them to sign in', async () => {
    const { rerender } = render(
      <I18nWrapper>
        <RolePlayGuestReply rolePlayId="hotel-check-in" />
      </I18nWrapper>,
    );

    const replyButton = screen.getByTestId('roleplay-guest-reply-button');
    expect(replyButton).toHaveAttribute('data-analytics', 'reply-first-line');
    fireEvent.click(replyButton);
    expect(recorder.startRecording).toHaveBeenCalled();

    recorder.transcriptionBlob = new Blob(['audio'], { type: 'audio/webm' });
    recorder.recordingMilliSeconds = 4000;
    rerender(
      <I18nWrapper>
        <RolePlayGuestReply rolePlayId="hotel-check-in" />
      </I18nWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to keep talking')).toBeInTheDocument();
    });
    expect(screen.getByTestId('roleplay-guest-reply-skeleton')).toBeInTheDocument();
    expect(screen.getByLabelText('You:')).toBeInTheDocument();
    expect(sendSpeechStart).toHaveBeenCalledWith('conversation');
    expect(hasGuestReply('hotel-check-in')).toBe(true);
    expect(screen.queryByTestId('roleplay-guest-reply-button')).not.toBeInTheDocument();
  });

  it('stops an in-progress recording', () => {
    recorder.isRecording = true;
    recorder.visualizerComponent = <div data-testid="voice-visualizer" />;
    render(
      <I18nWrapper>
        <RolePlayGuestReply rolePlayId="alias-game" />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('roleplay-guest-reply-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('voice-visualizer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(recorder.stopRecording).toHaveBeenCalled();
  });
});
