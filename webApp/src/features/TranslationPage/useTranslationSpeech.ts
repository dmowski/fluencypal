'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeLangCode } from '@/libs/language/type';
import { pickVoiceForLanguage, toSpeechLanguage } from './speechVoices';
import { TranslationSpeechItem } from './types';

type TranslationSpeechApi = {
  isSupported: boolean;
  isPlaying: boolean;
  speakingLanguage: NativeLangCode | null;
  play: (items: TranslationSpeechItem[]) => boolean;
  stop: () => void;
};

export const useTranslationSpeech = (): TranslationSpeechApi => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState<NativeLangCode | null>(null);
  const playbackGenerationRef = useRef(0);
  const queueRef = useRef<TranslationSpeechItem[]>([]);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      playbackGenerationRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) {
      return;
    }

    playbackGenerationRef.current += 1;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeakingLanguage(null);
  }, [isSupported]);

  const speakNext = useCallback(
    (generation: number) => {
      if (!isSupported || generation !== playbackGenerationRef.current) {
        return;
      }

      const nextItem = queueRef.current.shift();
      if (!nextItem) {
        setIsPlaying(false);
        setSpeakingLanguage(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      utterance.lang = toSpeechLanguage(nextItem.language);
      const matchingVoice = pickVoiceForLanguage(nextItem.language, voices);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        if (generation !== playbackGenerationRef.current) {
          return;
        }
        setIsPlaying(true);
        setSpeakingLanguage(nextItem.language);
      };

      utterance.onend = () => {
        if (generation !== playbackGenerationRef.current) {
          return;
        }
        speakNext(generation);
      };
      utterance.onerror = () => {
        if (generation !== playbackGenerationRef.current) {
          return;
        }
        speakNext(generation);
      };

      // Chrome silently pauses remote voices after idle. resume() un-stalls
      // the queue before enqueueing, matching Reader speech playback.
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices],
  );

  const play = useCallback(
    (items: TranslationSpeechItem[]) => {
      if (!isSupported) {
        return false;
      }

      const queue = items
        .map((item) => ({ ...item, text: item.text.trim() }))
        .filter((item) => item.text);
      if (queue.length === 0) {
        return false;
      }

      playbackGenerationRef.current += 1;
      const generation = playbackGenerationRef.current;
      queueRef.current = queue;
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setSpeakingLanguage(queue[0]?.language || null);
      speakNext(generation);
      return true;
    },
    [isSupported, speakNext],
  );

  return {
    isSupported,
    isPlaying,
    speakingLanguage,
    play,
    stop,
  };
};
