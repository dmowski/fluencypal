import { useCallback, useMemo } from 'react';
import { sleep } from '@/libs/sleep';
import { clearWordForAudio } from './clearWord';
import { getVoiceOverSpeakOptions } from './getVoiceOverSpeakOptions';
import { useConversationAudio } from './useConversationAudio';
import { SupportedLanguage } from '../Lang/lang';

export const useQuizWordAudio = ({ targetLanguage }: { targetLanguage: SupportedLanguage }) => {
  const audio = useConversationAudio();

  const speakOptions = useMemo(() => getVoiceOverSpeakOptions(targetLanguage), [targetLanguage]);

  const initAudio = useCallback(async () => {
    await audio.initAudio();
  }, [audio]);

  const cacheAudioWords = useCallback(
    async (words: string[]) => {
      for (const word of words) {
        const cleanWord = clearWordForAudio(word);
        if (!cleanWord) continue;

        await audio.setTextAsPotentialSpeak(cleanWord, speakOptions);
        await sleep(200);
      }
    },
    [audio, speakOptions],
  );

  const playWordAudio = useCallback(
    async (text: string) => {
      const cleanWord = clearWordForAudio(text);
      if (!cleanWord) return;

      await audio.playPotentialSpeakUrl(cleanWord, speakOptions);
    },
    [audio, speakOptions],
  );

  const preloadWordAudio = useCallback(
    async (word: string) => {
      await sleep(40);
      const cleanWord = clearWordForAudio(word);
      if (!cleanWord) return;

      await audio.setTextAsPotentialSpeak(cleanWord, speakOptions);
    },
    [audio, speakOptions],
  );

  return {
    speakOptions,
    initAudio,
    cacheAudioWords,
    playWordAudio,
    preloadWordAudio,
  };
};
