'use client';

import { useEffect, useState } from 'react';
import { NativeLangCode } from '@/libs/language/type';
import {
  DEFAULT_TRANSLATION_PAGE_SETTINGS,
  MAX_TRANSLATION_LANGUAGES,
  MIN_TRANSLATION_LANGUAGES,
} from './constants';
import { readTranslationPageSettings, writeTranslationPageSettings } from './settingsStorage';
import { TranslationPageSettings } from './types';

export const useTranslationPageSettings = () => {
  const [settings, setSettings] = useState<TranslationPageSettings>(
    DEFAULT_TRANSLATION_PAGE_SETTINGS,
  );

  useEffect(() => {
    setSettings(readTranslationPageSettings());
  }, []);

  const updateSettings = (patch: Partial<TranslationPageSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeTranslationPageSettings(next);
      return next;
    });
  };

  const setLanguages = (languages: NativeLangCode[]) => {
    if (languages.length < MIN_TRANSLATION_LANGUAGES) {
      return;
    }
    updateSettings({ languages: languages.slice(0, MAX_TRANSLATION_LANGUAGES) });
  };

  return {
    settings,
    setLanguages,
    setVoiceOverEnabled: (voiceOverEnabled: boolean) => updateSettings({ voiceOverEnabled }),
    setAutoPronounceSource: (autoPronounceSource: boolean) =>
      updateSettings({ autoPronounceSource }),
    setAutoPronounceResult: (autoPronounceResult: boolean) =>
      updateSettings({ autoPronounceResult }),
  };
};
