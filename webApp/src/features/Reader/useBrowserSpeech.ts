'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type BrowserSpeechApi = {
  isSupported: boolean;
  isPlaying: boolean;
  voices: SpeechSynthesisVoice[];
  language: string;
  selectedVoiceURI: string | null;
  play: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (voiceURI: string) => void;
};

type BrowserSpeechSettings = {
  language: string;
  selectedVoiceURI: string | null;
};

const BROWSER_SPEECH_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';

const getDefaultSettings = (): BrowserSpeechSettings => ({
  language: DEFAULT_LANGUAGE,
  selectedVoiceURI: null,
});

const getInitialSettings = (): BrowserSpeechSettings => {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }

  try {
    const rawSettings = window.localStorage.getItem(BROWSER_SPEECH_SETTINGS_KEY);
    if (!rawSettings) {
      return {
        language: window.navigator.language || DEFAULT_LANGUAGE,
        selectedVoiceURI: null,
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<BrowserSpeechSettings>;
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

const findMatchingVoice = (language: string, voices: SpeechSynthesisVoice[]) => {
  const normalizedLanguage = language.toLowerCase();

  return voices.find((voice) => {
    const voiceLanguage = voice.lang.toLowerCase();
    return (
      voiceLanguage === normalizedLanguage || voiceLanguage.startsWith(`${normalizedLanguage}-`)
    );
  });
};

export const useBrowserSpeech = (): BrowserSpeechApi => {
  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<BrowserSpeechSettings>(() => getInitialSettings());

  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [isSupported]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(BROWSER_SPEECH_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const stop = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.pause();
  }, [isSupported]);

  const [isPlaying, setIsPlaying] = useState(false);

  const setLanguage = useCallback((nextLanguage: string) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      language: nextLanguage,
      selectedVoiceURI: null,
    }));
  }, []);

  const setSelectedVoiceURI = useCallback(
    (voiceURI: string) => {
      setSettings((previousSettings) => ({
        ...previousSettings,
        selectedVoiceURI: voiceURI,
        language:
          voices.find((voice) => voice.voiceURI === voiceURI)?.lang || previousSettings.language,
      }));
    },
    [voices],
  );

  const resume = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.resume();
  }, [isSupported]);

  const play = useCallback(
    (text: string) => {
      if (!isSupported) return;

      const trimmedText = text.trim();
      if (!trimmedText) return;

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = settings.language;

      const selectedVoice = voices.find((voice) => voice.voiceURI === settings.selectedVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const matchingVoice = findMatchingVoice(settings.language, voices);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      window.speechSynthesis.cancel();
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => {
        setIsPlaying(false);
      };
    },
    [isSupported, settings.language, settings.selectedVoiceURI, voices],
  );

  return {
    isSupported,
    isPlaying,
    voices,
    language: settings.language,
    selectedVoiceURI: settings.selectedVoiceURI,
    play,
    stop,
    pause,
    resume,
    setLanguage,
    setSelectedVoiceURI,
  };
};
