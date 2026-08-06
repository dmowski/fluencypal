/** @jest-environment jsdom */

import { renderHook, act } from '@testing-library/react';
import { useQuizWordAudio } from './useQuizWordAudio';

const mockAudio = {
  initAudio: jest.fn(async () => undefined),
  isUnlocked: jest.fn(() => false),
  setTextAsPotentialSpeak: jest.fn(async () => undefined),
  playPotentialSpeakUrl: jest.fn(async () => undefined),
};

jest.mock('./useConversationAudio', () => ({
  useConversationAudio: () => mockAudio,
}));

jest.mock('./getVoiceOverSpeakOptions', () => ({
  getVoiceOverSpeakOptions: () => ({
    voice: 'alloy',
    instructions: 'test',
    cache: true,
  }),
}));

describe('useQuizWordAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudio.isUnlocked.mockReturnValue(false);
  });

  it('unlocks audio before playing a word when not yet unlocked', async () => {
    const { result } = renderHook(() => useQuizWordAudio({ targetLanguage: 'fr' }));

    await act(async () => {
      await result.current.playWordAudio('bonjour');
    });

    expect(mockAudio.initAudio).toHaveBeenCalledTimes(1);
    expect(mockAudio.playPotentialSpeakUrl).toHaveBeenCalledWith(
      'bonjour',
      expect.objectContaining({ voice: 'alloy' }),
    );
    expect(mockAudio.initAudio.mock.invocationCallOrder[0]).toBeLessThan(
      mockAudio.playPotentialSpeakUrl.mock.invocationCallOrder[0],
    );
  });

  it('skips unlock when audio is already unlocked', async () => {
    mockAudio.isUnlocked.mockReturnValue(true);
    const { result } = renderHook(() => useQuizWordAudio({ targetLanguage: 'fr' }));

    await act(async () => {
      await result.current.playWordAudio('merci');
    });

    expect(mockAudio.initAudio).not.toHaveBeenCalled();
    expect(mockAudio.playPotentialSpeakUrl).toHaveBeenCalledWith(
      'merci',
      expect.objectContaining({ voice: 'alloy' }),
    );
  });
});
