'use client';

import { createContext, useContext, useMemo, ReactNode, JSX } from 'react';
import { query, setDoc, where } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useSettings } from '@/features/Settings/useSettings';
import {
  ProgressAssessmentResult,
  ProgressSourceType,
  ProgressStat,
} from '@/features/ProgressStat/types';

export const PROGRESS_ALGORITHM_VERSION = 'score_v1';

export interface ProgressStatUpsertInput extends ProgressAssessmentResult {
  language: SupportedLanguage;
  sourceType: ProgressSourceType;
  sourceText: string;
  sourceId: string;
  textLength: number;
  algorithmVersion?: string;
  createdAtIso?: string;
}

export const buildProgressStatId = ({
  sourceType,
  sourceId,
  algorithmVersion,
}: {
  sourceType: ProgressSourceType;
  sourceId: string;
  algorithmVersion: string;
}) => {
  return [sourceType, encodeURIComponent(sourceId), algorithmVersion].join('_');
};

interface ProgressStatsContextType {
  progressStats: ProgressStat[];
  loadingProgressStats: boolean;
  errorProgressStats: Error | undefined;
  upsertProgressStat: (input: ProgressStatUpsertInput) => Promise<string>;
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
    if (!userId) {
      throw new Error('Invalid user id for progress stat save');
    }

    const algorithmVersion = input.algorithmVersion || PROGRESS_ALGORITHM_VERSION;
    const docId = buildProgressStatId({
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      algorithmVersion,
    });
    const documentRef = db.documents.progressStat(userId, docId);

    if (!documentRef) {
      throw new Error('Invalid progress stat document reference');
    }

    const createdAtIso = input.createdAtIso ?? new Date().toISOString();
    const progressStat: ProgressStat = {
      userId,
      language: input.language,
      sourceType: input.sourceType,
      sourceText: input.sourceText,
      sourceId: input.sourceId,
      grammar: input.grammar,
      grammarSummary: input.grammarSummary,
      vocabulary: input.vocabulary,
      vocabularySummary: input.vocabularySummary,
      fluency: input.fluency,
      fluencySummary: input.fluencySummary,
      confidence: input.confidence,
      confidenceSummary: input.confidenceSummary,
      assessmentConfidence: input.assessmentConfidence,
      textLength: input.textLength,
      algorithmVersion,
      createdAtIso,
    };

    await setDoc(documentRef, progressStat);
    return docId;
  };

  return {
    progressStats,
    loadingProgressStats,
    errorProgressStats,
    upsertProgressStat,
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
