import { useEffect } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { clearPendingTeacherVoice, readPendingTeacherVoice } from './pendingTeacherVoice';

/**
 * Writes a locally chosen teacher voice to user settings after sign-in.
 * Must stay mounted across quiz steps — the picker unmounts on Continue.
 */
export const useFlushPendingTeacherVoice = () => {
  const auth = useAuth();
  const settings = useSettings();
  const savedVoice = settings.userSettings?.teacherVoice || null;

  useEffect(() => {
    if (!auth.uid) return;

    const pending = readPendingTeacherVoice();
    if (!pending) return;

    if (savedVoice === pending) {
      clearPendingTeacherVoice();
      return;
    }

    void settings
      .setVoice(pending)
      .then(() => {
        if (readPendingTeacherVoice() === pending) {
          clearPendingTeacherVoice();
        }
      })
      .catch(() => {});
  }, [auth.uid, savedVoice, settings.setVoice]);
};
