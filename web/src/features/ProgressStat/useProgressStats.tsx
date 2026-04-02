'use client';

import { createContext, useContext, useMemo, ReactNode, JSX } from 'react';
import { getDoc, query, setDoc, where } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { useSettings } from '@/features/Settings/useSettings';
import { ProgressStat, ProgressStatUpsertInput } from '@/features/ProgressStat/types';
import { createProgressStatData } from './createProgressStatData';

export interface ProgressStatsContextType {
  progressStats: ProgressStat[];
  loadingProgressStats: boolean;
  errorProgressStats: Error | undefined;
  upsertProgressStat: (input: ProgressStatUpsertInput) => Promise<string>;
  isAlreadyEvaluated: (progressStatId: string) => Promise<boolean>;
}

const ProgressStatsContext = createContext<ProgressStatsContextType | null>(null);

function useProvideProgressStats(): ProgressStatsContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;
  const language = settings.languageCode;

  const progressStatsQuery = useMemo(() => {
    if (!userId || !language) {
      return null;
    }

    const collectionRef = db.collections.progressStats(userId);
    return collectionRef ? query(collectionRef, where('language', '==', language)) : null;
  }, [language, userId]);

  const [progressStats = [], loadingProgressStats, errorProgressStats] =
    useCollectionData(progressStatsQuery);

  const upsertProgressStat = async (input: ProgressStatUpsertInput): Promise<string> => {
    const progressStat = createProgressStatData({ input, userId: userId });

    const documentRef = db.documents.progressStat(progressStat.documentId);

    if (!documentRef) {
      throw new Error('Invalid progress stat document reference');
    }

    await setDoc(documentRef, progressStat.stat);
    return progressStat.documentId;
  };

  const isAlreadyEvaluated = async (progressStatId: string): Promise<boolean> => {
    const documentRef = db.documents.progressStat(userId, progressStatId);
    if (!documentRef) {
      throw new Error('Invalid progress stat document reference');
    }
    const doc = await getDoc(documentRef);
    return doc.exists();
  };

  return {
    progressStats,
    loadingProgressStats,
    errorProgressStats,
    upsertProgressStat,
    isAlreadyEvaluated,
  };
}

export function ProgressStatsProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideProgressStats();
  return <ProgressStatsContext.Provider value={hook}>{children}</ProgressStatsContext.Provider>;
}

export const useProgressStats = (): ProgressStatsContextType => {
  const context = useContext(ProgressStatsContext);
  if (!context) {
    throw new Error('useProgressStats must be used within a ProgressStatsProvider');
  }
  return context;
};
