/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { useQuizTeacherVoice } from './useQuizTeacherVoice';

const mockSetVoice = jest.fn(async () => undefined);
const mockAuth = { uid: 'user-1' };
const mockSettings = {
  userSettings: { teacherVoice: null as string | null },
  setVoice: mockSetVoice,
};

jest.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => mockSettings,
}));

describe('useQuizTeacherVoice', () => {
  beforeEach(() => {
    mockSetVoice.mockClear();
    mockSetVoice.mockResolvedValue(undefined);
    mockSettings.userSettings = { teacherVoice: null };
  });

  it('writes the chosen voice to settings immediately', async () => {
    const { result } = renderHook(() => useQuizTeacherVoice());

    await act(async () => {
      await result.current.selectVoice('verse');
    });

    expect(result.current.selectedVoice).toBe('verse');
    expect(mockSetVoice).toHaveBeenCalledWith('verse');
  });

  it('prefers the saved settings voice over the optimistic pick', () => {
    mockSettings.userSettings = { teacherVoice: 'marin' };

    const { result } = renderHook(() => useQuizTeacherVoice());

    expect(result.current.selectedVoice).toBe('marin');
    expect(result.current.savedVoice).toBe('marin');
  });
});
