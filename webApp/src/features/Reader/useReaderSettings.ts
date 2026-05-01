'use client';

import { useCallback, useEffect, useState } from 'react';

type ReaderSettings = {
  language: string;
  selectedVoiceURI: string | null;
};

type ReaderSettingsApi = {
  language: string;
  selectedVoiceURI: string | null;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (nextVoiceURI: string | null) => void;
};

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';

const getInitialSettings = (): ReaderSettings => {
  if (typeof window === 'undefined') {
    return {
      language: DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
    };
  }

  try {
    const rawSettings = window.localStorage.getItem(READER_SETTINGS_KEY);
    if (!rawSettings) {
      return {
        language: window.navigator.language || DEFAULT_LANGUAGE,
        selectedVoiceURI: null,
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<ReaderSettings>;
    return {
      language: parsedSettings.language || window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: parsedSettings.selectedVoiceURI || null,
    };
  } catch {
    return {
      language: window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
    };
  }
};

export const useReaderSettings = (): ReaderSettingsApi => {
  const [settings, setSettings] = useState<ReaderSettings>(() => getInitialSettings());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const setLanguage = useCallback((nextLanguage: string) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      language: nextLanguage,
      selectedVoiceURI: null,
    }));
  }, []);

  const setSelectedVoiceURI = useCallback((nextVoiceURI: string | null) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      selectedVoiceURI: nextVoiceURI,
    }));
  }, []);

  return {
    language: settings.language,
    selectedVoiceURI: settings.selectedVoiceURI,
    setLanguage,
    setSelectedVoiceURI,
  };
};
