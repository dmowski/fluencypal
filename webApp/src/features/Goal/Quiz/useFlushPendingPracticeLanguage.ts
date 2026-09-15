import { useEffect } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import {
  clearPendingPracticeLanguage,
  readPendingPracticeLanguage,
} from './pendingPracticeLanguage';

export const useFlushPendingPracticeLanguage = () => {
  const auth = useAuth();
  const settings = useSettings();
  const savedLanguage = settings.userSettings?.languageCode || null;

  useEffect(() => {
    if (!auth.uid) return;

    const pending = readPendingPracticeLanguage();
    if (!pending) return;

    if (savedLanguage === pending) {
      clearPendingPracticeLanguage();
      return;
    }

    void settings
      .setLanguage(pending)
      .then(() => {
        if (readPendingPracticeLanguage() === pending) {
          clearPendingPracticeLanguage();
        }
      })
      .catch(() => {});
  }, [auth.uid, savedLanguage, settings.setLanguage]);
};
