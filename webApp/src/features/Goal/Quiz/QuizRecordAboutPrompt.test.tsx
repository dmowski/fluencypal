/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nWrapper } from '@/features/Alias/test-utils/i18nTestHelper';
import { QuizRecordAboutPrompt } from './QuizRecordAboutPrompt';

const mockSpeak = jest.fn(async () => undefined);
const mockInterrupt = jest.fn();
const mockInitAudio = jest.fn(async () => undefined);
const mockIsUnlocked = jest.fn(() => true);

jest.mock('@/features/Audio/useConversationAudio', () => ({
  useConversationAudio: () => ({
    speak: mockSpeak,
    interrupt: mockInterrupt,
    initAudio: mockInitAudio,
    isUnlocked: mockIsUnlocked,
    isPlaying: false,
  }),
}));

jest.mock('./useQuizTeacherVoice', () => ({
  useQuizTeacherVoice: () => ({
    selectedVoice: 'ash',
    selectVoice: jest.fn(),
  }),
}));

jest.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    aiVoiceSpeed: 'normal',
    userSettings: { languageCode: 'en', teacherVoice: 'ash' },
  }),
}));

describe('QuizRecordAboutPrompt', () => {
  beforeEach(() => {
    mockSpeak.mockClear();
    mockInterrupt.mockClear();
    mockInitAudio.mockClear();
    mockIsUnlocked.mockReturnValue(true);
  });

  it('autoplays the chosen teacher asking the question', async () => {
    render(
      <I18nWrapper>
        <QuizRecordAboutPrompt text="Tell me about yourself. Why do you want to practice speaking?" />
      </I18nWrapper>,
    );

    expect(screen.getByTestId('quiz-record-about-prompt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hear the question' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalledWith(
        'Tell me about yourself. Why do you want to practice speaking?',
        expect.objectContaining({
          voice: 'ash',
          cache: true,
        }),
      );
    });
  });

  it('replays the question when Hear is clicked', async () => {
    render(
      <I18nWrapper>
        <QuizRecordAboutPrompt text="Tell me about yourself." />
      </I18nWrapper>,
    );

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled();
    });
    mockSpeak.mockClear();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Hear the question' })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hear the question' }));

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalledWith(
        'Tell me about yourself.',
        expect.objectContaining({ voice: 'ash' }),
      );
    });
  });
});
