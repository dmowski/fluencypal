"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { WordsStats } from "@/common/words";
import { getWordsFromText } from "@/libs/getWordsFromText";
import { useSettings } from "../Settings/useSettings";
import { sendAiRequest } from "../Ai/sendAiRequest";

interface WordsContextType {
  wordsStats: WordsStats | null;
  loading: boolean;
  addWordsStatFromText: (text: string) => Promise<void>;
  totalWordsCount: number;
  getNewWordsToLearn: () => Promise<string[]>;
  removeWordsToLearn: () => void;
  wordsToLearn: string[];
  isGeneratingWords: boolean;
}

const WordsContext = createContext<WordsContextType | null>(null);

function useProvideWords(): WordsContextType {
  const auth = useAuth();
  const settings = useSettings();
  const wordsStatsDocRef = db.documents.userWordsStats(auth.uid, settings.language);
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

  const [isGeneratingWords, setIsGeneratingWords] = useState(false);
  const [wordsToLearn, setWordsToLearn] = useState<string[]>([]);
  const getNewWordsToLearn = async () => {
    const language = settings?.language;
    if (!language) return [];

    const dictionary = wordsStats?.dictionary || {};
    const knownWords = Object.keys(dictionary).filter((word) => dictionary[word] > 0);
    setWordsToLearn([]);
    try {
      setIsGeneratingWords(true);
      const systemInstruction = [
        `User provides list of works that he knows.`,
        `System should generate list of 10 new words to learn.`,
        `Words should be useful and not too difficult.`,
        `Split words by comma.`,
      ].join(" ");
      const response = await sendAiRequest({
        language,
        systemMessage: systemInstruction,
        userMessage: knownWords.join(" "),
        model: "gpt-4o",
      });
      const newWordsToLearn = response.aiResponse.split(",").map((word) => word.trim());
      setIsGeneratingWords(false);
      setWordsToLearn(newWordsToLearn);

      return newWordsToLearn;
    } catch (error) {
      setIsGeneratingWords(false);
      throw error;
    }
  };

  return {
    isGeneratingWords,
    removeWordsToLearn: () => setWordsToLearn([]),
    wordsStats: wordsStats || null,
    getNewWordsToLearn,
    wordsToLearn,
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
