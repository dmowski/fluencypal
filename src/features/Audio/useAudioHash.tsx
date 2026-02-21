'use client';
import { createContext, useContext, ReactNode, JSX, useRef } from 'react';
import { SpeakOptions, useConversationAudio } from './useConversationAudio';
import { uniq } from '@/libs/uniq';

interface AudioCacheContextType {
  cacheAudioWords: (words: string[], options: SpeakOptions) => Promise<void>;
}

const AudioCacheContext = createContext<AudioCacheContextType | null>(null);

function useProvideAudioCache(): AudioCacheContextType {
  const audio = useConversationAudio();
  const cachedWordStateMap = useRef<Record<string, 'pending' | 'done'>>({});

  const cacheAudioWords = async (words: string[], options: SpeakOptions) => {
    const uniqueWords = uniq(words).filter(Boolean);
    const wordsToCache = uniqueWords.filter((word) => !cachedWordStateMap.current[word]);

    if (wordsToCache.length === 0) {
      return;
    }

    wordsToCache.forEach((word) => {
      cachedWordStateMap.current[word] = 'pending';
    });

    for (const word of wordsToCache) {
      try {
        await audio.initCache(word, options);
        cachedWordStateMap.current[word] = 'done';
      } catch {
        delete cachedWordStateMap.current[word];
      }
    }
  };

  return {
    cacheAudioWords,
  };
}

export function AudioCacheProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideAudioCache();
  return <AudioCacheContext.Provider value={hook}>{children}</AudioCacheContext.Provider>;
}

export const useAudioCache = (): AudioCacheContextType => {
  const context = useContext(AudioCacheContext);
  if (!context) {
    throw new Error('useAudioCache must be used within a AudioCacheProvider');
  }
  return context;
};
