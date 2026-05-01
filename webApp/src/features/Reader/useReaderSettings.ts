'use client';

import {
  createElement,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NativeLangCode } from '@/libs/language/type';

type ReaderSettings = {
  language: string;
  selectedVoiceURI: string | null;
  translateToLanguage: NativeLangCode | null;
};

type ReaderSettingsApi = {
  language: string;
  selectedVoiceURI: string | null;
  translateToLanguage: NativeLangCode | null;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (nextVoiceURI: string | null) => void;
  setTranslateToLanguage: (nextLanguage: NativeLangCode | null) => void;
};

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';
const ReaderSettingsContext = createContext<ReaderSettingsApi | null>(null);

const getInitialSettings = (): ReaderSettings => {
  if (typeof window === 'undefined') {
    return {
      language: DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
    };
  }

  try {
    const rawSettings = window.localStorage.getItem(READER_SETTINGS_KEY);
    if (!rawSettings) {
      return {
        language: window.navigator.language || DEFAULT_LANGUAGE,
        selectedVoiceURI: null,
        translateToLanguage: null,
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<ReaderSettings>;
    return {
      language: parsedSettings.language || window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: parsedSettings.selectedVoiceURI || null,
      translateToLanguage: parsedSettings.translateToLanguage || null,
    };
  } catch {
    return {
      language: window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
    };
  }
};

const useReaderSettingsState = (): ReaderSettingsApi => {
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

  const setTranslateToLanguage = useCallback((nextLanguage: NativeLangCode | null) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      translateToLanguage: nextLanguage,
    }));
  }, []);

  return useMemo(
    () => ({
      language: settings.language,
      selectedVoiceURI: settings.selectedVoiceURI,
      translateToLanguage: settings.translateToLanguage,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
    }),
    [
      settings.language,
      settings.selectedVoiceURI,
      settings.translateToLanguage,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
    ],
  );
};

export const ReaderSettingsProvider = ({ children }: { children: ReactNode }) => {
  const value = useReaderSettingsState();

  return createElement(ReaderSettingsContext.Provider, { value }, children);
};

export const useReaderSettings = (): ReaderSettingsApi => {
  const context = useContext(ReaderSettingsContext);

  if (!context) {
    throw new Error('useReaderSettings must be used within ReaderSettingsProvider');
  }

  return context;
};
