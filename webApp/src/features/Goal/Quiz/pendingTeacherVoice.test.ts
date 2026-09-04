/** @jest-environment jsdom */

import {
  clearPendingTeacherVoice,
  PENDING_TEACHER_VOICE_KEY,
  readPendingTeacherVoice,
  writePendingTeacherVoice,
} from './pendingTeacherVoice';

describe('pendingTeacherVoice', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads a stored voice and ignores unknown values', () => {
    expect(readPendingTeacherVoice()).toBeNull();

    writePendingTeacherVoice('marin');
    expect(window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY)).toBe('marin');
    expect(readPendingTeacherVoice()).toBe('marin');

    window.localStorage.setItem(PENDING_TEACHER_VOICE_KEY, 'not-a-voice');
    expect(readPendingTeacherVoice()).toBeNull();
  });

  it('clears the stored voice', () => {
    writePendingTeacherVoice('ash');
    clearPendingTeacherVoice();
    expect(readPendingTeacherVoice()).toBeNull();
  });
});
