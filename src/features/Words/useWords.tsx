"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { WordsStats } from "@/common/words";
import { getWordsFromText } from "@/libs/getWordsFromText";

interface WordsContextType {
  wordsStats: WordsStats | null;
  loading: boolean;
  addWordsStatFromText: (text: string) => Promise<void>;
  totalWordsCount: number;
}

const WordsContext = createContext<WordsContextType | null>(null);

function useProvideWords(): WordsContextType {
  const auth = useAuth();
  const wordsStatsDocRef = db.documents.userWordsStats(auth.uid);
  const [wordsStats, loading] = useDocumentData(wordsStatsDocRef);

  const totalWordsCount = useMemo(() => {
    if (!wordsStats) return 0;
    return Object.keys(wordsStats.dictionary).length;
  }, [wordsStats]);

  const addWords = async (newWords: Record<string, number>) => {
    if (!wordsStatsDocRef) return;
    const partToUpdate = Object.keys(newWords).reduce(
      (acc, word) => {
        acc[word] = (wordsStats?.dictionary?.[word] || 0) + newWords[word];
        return acc;
      },
      {} as Record<string, number>
    );

    await setDoc(
      wordsStatsDocRef,
      {
        dictionary: partToUpdate,
      },
      { merge: true }
    );
  };

  const addWordsStatFromText = async (text: string) => {
    const stat = getWordsFromText(text);
    await addWords(stat);
  };

  return {
    wordsStats: wordsStats || null,
    totalWordsCount,
    loading,
    addWordsStatFromText,
  };
}

export function WordsProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideWords();
  return <WordsContext.Provider value={hook}>{children}</WordsContext.Provider>;
}

export const useWords = (): WordsContextType => {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error("useWords must be used within a UsageProvider");
  }
  return context;
};
