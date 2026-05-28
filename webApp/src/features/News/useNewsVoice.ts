'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SupportedLanguage, speechRecognitionLanguages } from '../Lang/lang';

const STORAGE_KEY_PREFIX = 'news-voice-v1';

const readStoredVoiceURI = (languageCode: SupportedLanguage): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(`${STORAGE_KEY_PREFIX}-${languageCode}`);
  } catch {
    return null;
  }
};

const writeStoredVoiceURI = (languageCode: SupportedLanguage, voiceURI: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    const key = `${STORAGE_KEY_PREFIX}-${languageCode}`;
    if (voiceURI === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, voiceURI);
    }
  } catch {
    // Ignore quota / disabled storage.
  }
};

const PREFERRED_VOICE_NAMES = [
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Samantha',
];

const findBestVoice = (
  bcp47Language: string,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined => {
  const normalized = bcp47Language.toLowerCase();

  for (const preferred of PREFERRED_VOICE_NAMES) {
    const match = voices.find((v) => v.name === preferred);
    if (match) return match;
  }

  return (
    voices.find((v) => v.lang.toLowerCase() === normalized) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(`${normalized.split('-')[0]}-`))
  );
};

export type NewsVoiceApi = {
  isSupported: boolean;
  isPlaying: boolean;
  /** All voices available for the language. Empty when none found. */
  voices: SpeechSynthesisVoice[];
  /** BCP-47 language tag derived from languageCode. */
  bcp47Language: string;
  /** Explicitly stored voice URI; null means "use best available". */
  selectedVoiceURI: string | null;
  /** Resolved voice URI: stored value if available, otherwise best matching voice. */
  effectiveVoiceURI: string | null;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export const useNewsVoice = (languageCode: SupportedLanguage): NewsVoiceApi => {
  const bcp47Language = speechRecognitionLanguages[languageCode];

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(() =>
    readStoredVoiceURI(languageCode),
  );

  // Reset stored voice when language changes.
  useEffect(() => {
    setSelectedVoiceURIState(readStoredVoiceURI(languageCode));
  }, [languageCode]);

  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      setAllVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [isSupported]);

  const voices = useMemo(() => {
    const normalized = bcp47Language.toLowerCase();
    const langPrefix = normalized.split('-')[0];
    return allVoices.filter((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang === normalized || vLang.startsWith(`${langPrefix}-`);
    });
  }, [allVoices, bcp47Language]);

  const effectiveVoiceURI = useMemo(() => {
    const storedIsAvailable = voices.some((v) => v.voiceURI === selectedVoiceURI);
    if (storedIsAvailable) return selectedVoiceURI;
    return findBestVoice(bcp47Language, voices)?.voiceURI ?? voices[0]?.voiceURI ?? null;
  }, [voices, selectedVoiceURI, bcp47Language]);

  const setSelectedVoiceURI = useCallback(
    (voiceURI: string | null) => {
      setSelectedVoiceURIState(voiceURI);
      writeStoredVoiceURI(languageCode, voiceURI);
    },
    [languageCode],
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
  }, [isSupported]);

  const play = useCallback(
    (text: string) => {
      if (!isSupported) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = bcp47Language;

      const voiceToUse = allVoices.find((v) => v.voiceURI === effectiveVoiceURI);
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, bcp47Language, allVoices, effectiveVoiceURI],
  );

  return {
    isSupported,
    isPlaying,
    voices,
    bcp47Language,
    selectedVoiceURI,
    effectiveVoiceURI,
    setSelectedVoiceURI,
    play,
    pause,
    resume,
    stop,
  };
};
