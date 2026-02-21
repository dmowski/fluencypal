'use client';
import { createContext, useContext, ReactNode, JSX, useRef } from 'react';
import { SpeakOptions, useConversationAudio } from './useConversationAudio';
import { uniq } from '@/libs/uniq';
import { getHash } from '@/libs/hash';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { getDoc, setDoc } from 'firebase/firestore';
import { AudioCache } from './types';

interface AudioCacheContextType {
  cacheAudioWords: (words: string[], options: SpeakOptions) => Promise<void>;
}

const AudioCacheContext = createContext<AudioCacheContextType | null>(null);

const getAudioHash = (text: string, options: SpeakOptions): string => {
  const data = [text, options.instructions, options.voice]
    .filter(Boolean)
    .map((part) => getHash(part))
    .join('-');
  return data;
};

function useProvideAudioCache(): AudioCacheContextType {
  const audio = useConversationAudio();
  const cachedWordStateMap = useRef<Record<string, 'pending' | 'done'>>({});
  const auth = useAuth();

  const isAudioGeneratedInDb = async (text: string, options: SpeakOptions) => {
    const hash = getAudioHash(text, options);
    try {
      const documentRef = db.documents.audioCache(auth.uid, hash);
      if (!documentRef) return false;
      const doc = await getDoc(documentRef);
      return doc.exists();
    } catch (e) {
      console.log('Error checking audio cache in DB', e);
      return false;
    }
  };

  const saveAudioToDb = async (text: string, options: SpeakOptions) => {
    const hash = getAudioHash(text, options);
    const audioData: AudioCache = {
      text: text,
      voice: options.voice,
      isSilence: false,
      instruction: options.instructions || '',
      hash: hash,
    };
    try {
      const documentRef = db.documents.audioCache(auth.uid, hash);
      if (!documentRef) return;
      await setDoc(documentRef, audioData);
    } catch (e) {
      console.log('Error saving audio cache to DB', e);
    }
  };

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
        const isSkipCheckingSilence = await isAudioGeneratedInDb(word, options);

        const isDoneAndNotSilent = await audio.initCache(word, options, 0, isSkipCheckingSilence);
        if (isDoneAndNotSilent) {
          cachedWordStateMap.current[word] = 'done';

          if (!isSkipCheckingSilence) {
            await saveAudioToDb(word, options);
          }
        } else {
          delete cachedWordStateMap.current[word];
        }
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
