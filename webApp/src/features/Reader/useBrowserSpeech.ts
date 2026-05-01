'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReaderSettings } from './useReaderSettings';

type BrowserSpeechApi = {
  isSupported: boolean;
  isPlaying: boolean;
  voices: SpeechSynthesisVoice[];
  language: string;
  selectedVoiceURI: string | null;
  play: (text: string, voiceURIOverride?: string | null) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
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
  const { language, selectedVoiceURI, setLanguage, setSelectedVoiceURI } = useReaderSettings();

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

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

  const stop = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.pause();
  }, [isSupported]);

  const [isPlaying, setIsPlaying] = useState(false);

  const resume = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.resume();
  }, [isSupported]);

  const play = useCallback(
    (text: string, voiceURIOverride?: string | null) => {
      if (!isSupported) return;

      const trimmedText = text.trim();
      if (!trimmedText) return;

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = language;

      const activeVoiceURI = voiceURIOverride ?? selectedVoiceURI;
      const selectedVoice = voices.find((voice) => voice.voiceURI === activeVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const matchingVoice = findMatchingVoice(language, voices);
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
    [isSupported, language, selectedVoiceURI, voices],
  );

  return {
    isSupported,
    isPlaying,
    voices,
    language,
    selectedVoiceURI,
    play,
    stop,
    pause,
    resume,
    setLanguage,
    setSelectedVoiceURI,
  };
};
