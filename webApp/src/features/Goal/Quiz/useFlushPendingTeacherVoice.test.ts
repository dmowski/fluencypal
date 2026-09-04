/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { useFlushPendingTeacherVoice } from './useFlushPendingTeacherVoice';
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

describe('useFlushPendingTeacherVoice', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSetVoice.mockClear();
    mockSetVoice.mockResolvedValue(undefined);
    mockAuth.uid = null;
    mockSettings.userSettings = { teacherVoice: null };
  });

  it('writes the pending voice after sign-in even if the picker unmounted', async () => {
    const flush = renderHook(() => useFlushPendingTeacherVoice());
    const picker = renderHook(() => useQuizTeacherVoice());

    await act(async () => {
      await picker.result.current.selectVoice('ash');
    });
    picker.unmount();

    expect(mockSetVoice).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY)).toBe('ash');

    mockAuth.uid = 'user-1';
    flush.rerender();

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSetVoice).toHaveBeenCalledWith('ash');
    expect(window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY)).toBeNull();
  });

  it('does nothing when there is no pending voice', async () => {
    mockAuth.uid = 'user-1';
    renderHook(() => useFlushPendingTeacherVoice());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSetVoice).not.toHaveBeenCalled();
  });
});
