/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { useQuizTeacherVoice } from './useQuizTeacherVoice';
import { PENDING_TEACHER_VOICE_KEY } from './pendingTeacherVoice';

const mockSetVoice = jest.fn(async () => undefined);
const mockAuth = { uid: null as string | null };
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
    window.localStorage.clear();
    mockSetVoice.mockClear();
    mockSetVoice.mockResolvedValue(undefined);
    mockAuth.uid = null;
    mockSettings.userSettings = { teacherVoice: null };
  });

  it('keeps the chosen voice locally when the visitor is unsigned', async () => {
    const { result } = renderHook(() => useQuizTeacherVoice());

    await act(async () => {
      await result.current.selectVoice('verse');
    });

    expect(result.current.selectedVoice).toBe('verse');
    expect(window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY)).toBe('verse');
    expect(mockSetVoice).not.toHaveBeenCalled();
  });

  it('writes immediately when the visitor is already signed in', async () => {
    mockAuth.uid = 'user-1';
    const { result } = renderHook(() => useQuizTeacherVoice());

    await act(async () => {
      await result.current.selectVoice('verse');
    });

    expect(mockSetVoice).toHaveBeenCalledWith('verse');
    expect(window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY)).toBe('verse');
  });

  it('keeps the pending voice when a signed-in settings write fails', async () => {
    mockAuth.uid = 'user-1';
    mockSetVoice.mockRejectedValue(new Error('permission-denied'));
    const { result } = renderHook(() => useQuizTeacherVoice());

    await act(async () => {
      await result.current.selectVoice('verse');
    });

    expect(result.current.selectedVoice).toBe('verse');
    expect(window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY)).toBe('verse');
  });

  it('prefers the saved settings voice over the pending one', () => {
    window.localStorage.setItem(PENDING_TEACHER_VOICE_KEY, 'ash');
    mockSettings.userSettings = { teacherVoice: 'marin' };

    const { result } = renderHook(() => useQuizTeacherVoice());

    expect(result.current.selectedVoice).toBe('marin');
  });
});
