'use client';

import { useCallback, useMemo, useState } from 'react';

type BrowserSpeechApi = {
  isSupported: boolean;
  isPlaying: boolean;
  play: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
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

export const useBrowserSpeech = (language: string): BrowserSpeechApi => {
  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

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
    (text: string) => {
      if (!isSupported) return;

      const trimmedText = text.trim();
      if (!trimmedText) return;

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = language;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = findMatchingVoice(language, voices);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.cancel();
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => {
        setIsPlaying(false);
      };
    },
    [isSupported, language],
  );

  return {
    isSupported,
    isPlaying,
    play,
    stop,
    pause,
    resume,
  };
};
