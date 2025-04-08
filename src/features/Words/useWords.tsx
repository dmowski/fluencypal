"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { WordsStats } from "@/common/words";
import { getWordsFromText } from "@/libs/getWordsFromText";
import { useSettings } from "../Settings/useSettings";
import { useTextAi } from "../Ai/useTextAi";
import { GoalElementInfo } from "../Plan/types";

interface WordsContextType {
  wordsStats: WordsStats | null;
  loading: boolean;
  addWordsStatFromText: (text: string) => Promise<string[]>;
  totalWordsCount: number;
  getNewWordsToLearn: (goal?: GoalElementInfo) => Promise<string[]>;
  removeWordsToLearn: () => void;
  wordsToLearn: string[];
  isGeneratingWords: boolean;
  goal: GoalElementInfo | null;
}

const WordsContext = createContext<WordsContextType | null>(null);

function useProvideWords(): WordsContextType {
  const auth = useAuth();
  const settings = useSettings();
  const wordsStatsDocRef = db.documents.userWordsStats(auth.uid, settings.languageCode);
  const [wordsStats, loading] = useDocumentData(wordsStatsDocRef);
  const textAi = useTextAi();
  const [isGeneratingWords, setIsGeneratingWords] = useState(false);
  const [wordsToLearn, setWordsToLearn] = useState<string[]>([]);
  const [goal, setGoal] = useState<GoalElementInfo | null>(null);

  const totalWordsCount = useMemo(() => {
    if (!wordsStats) return 0;
    return Object.keys(wordsStats.dictionary).length;
  }, [wordsStats]);

  const addWords = async (newWords: Record<string, number>) => {
    if (!wordsStatsDocRef) {
      throw new Error("Words stats doc ref is not defined");
    }

    const newWordsList: string[] = [];
    Object.keys(newWords).forEach((word) => {
      const isUsedWord = wordsStats?.dictionary?.[word];
      if (!isUsedWord && !wordsToLearn.includes(word)) {
        newWordsList.push(word);
      }
    });

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

    return newWordsList;
  };

  const addWordsStatFromText = async (text: string) => {
    const stat = getWordsFromText(text);
    return await addWords(stat);
  };

  const getNewWordsToLearn = async (goal?: GoalElementInfo) => {
    const dictionary = wordsStats?.dictionary || {};
    setGoal(goal || null);
    const knownWords = Object.keys(dictionary).filter((word) => dictionary[word] > 0);
    setWordsToLearn([]);
    try {
      setIsGeneratingWords(true);

      const systemInstruction = [
        `User provides list of works that they knows.
You should generate list of 10 new words to learn.
Words should be useful for daily basis usage and not too difficult.
${goal ? `Follow this topic: ${goal.goalElement.title} - ${goal.goalElement.description}` : ""}
Return info in JSON format. Example: ["word1", "word2", "word3"].
Do not wrap answer with any wrapper phrases.
Your response will be sent to JSON.parse() function.
`,
      ].join(" ");
      const response = await textAi.generate({
        systemMessage: systemInstruction,
        userMessage: knownWords.join(" "),
        model: "gpt-4o",
      });
      const newWordsToLearn = JSON.parse(response) as string[];
      setIsGeneratingWords(false);
      setWordsToLearn(newWordsToLearn.map((word) => word.toLowerCase()));

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
    goal,
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
