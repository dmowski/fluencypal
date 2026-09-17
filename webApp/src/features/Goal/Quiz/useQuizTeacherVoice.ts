import { useEffect, useState } from 'react';
import { AiVoice } from '@/features/Ai/ai';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';

export const useQuizTeacherVoice = () => {
  const auth = useAuth();
  const settings = useSettings();
  const savedVoice = settings.userSettings?.teacherVoice || null;
  const [optimisticVoice, setOptimisticVoice] = useState<AiVoice | null>(null);

  const selectedVoice = savedVoice || optimisticVoice;

  useEffect(() => {
    if (!auth.uid || !optimisticVoice) {
      return;
    }
    if (savedVoice === optimisticVoice) {
      return;
    }
    void settings.setVoice(optimisticVoice);
  }, [auth.uid, optimisticVoice, savedVoice, settings.setVoice]);

  const selectVoice = async (voice: AiVoice) => {
    setOptimisticVoice(voice);
    if (!auth.uid) {
      return;
    }
    await settings.setVoice(voice);
  };

  return { selectedVoice, savedVoice, selectVoice };
};
