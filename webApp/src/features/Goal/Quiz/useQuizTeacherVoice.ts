import { useState } from 'react';
import { AiVoice } from '@/features/Ai/ai';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { readPendingTeacherVoice, writePendingTeacherVoice } from './pendingTeacherVoice';

export const useQuizTeacherVoice = () => {
  const auth = useAuth();
  const settings = useSettings();
  const savedVoice = settings.userSettings?.teacherVoice || null;
  const [pendingVoice, setPendingVoice] = useState<AiVoice | null>(readPendingTeacherVoice);

  const selectedVoice = savedVoice || pendingVoice;

  const selectVoice = async (voice: AiVoice) => {
    setPendingVoice(voice);
    writePendingTeacherVoice(voice);
    if (!auth.uid) return;
    try {
      await settings.setVoice(voice);
    } catch {
      // Settings write can fail before the user document exists; pending voice is enough.
    }
  };

  return { selectedVoice, selectVoice };
};
