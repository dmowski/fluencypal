'use client';
import { createContext, useContext, ReactNode, JSX, useRef } from 'react';
import { SpeakOptions, useConversationAudio } from './useConversationAudio';
import { uniq } from '@/libs/uniq';
import { getHash } from '@/libs/hash';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { getDoc, setDoc } from 'firebase/firestore';
import { AudioCache } from './types';
import { sleep } from '@/libs/sleep';

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

    const processWord = async (word: string) => {
      try {
        const isSkipCheckingSilence = await isAudioGeneratedInDb(word, options);

        if (!isSkipCheckingSilence) {
          console.log('Generate from scratch', word);
        }

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
    };

    const isDoInParallel = false;

    if (isDoInParallel) {
      const chunkSize = 4;
      const chunks: string[][] = [];
      for (let i = 0; i < wordsToCache.length; i += chunkSize) {
        chunks.push(wordsToCache.slice(i, i + chunkSize));
      }
      console.log('chunks', chunks.length);
      for (const chunk of chunks) {
        await Promise.all(chunk.map((word) => processWord(word)));
        await sleep(100);
      }
    } else {
      for (const word of wordsToCache) {
        await processWord(word);
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
