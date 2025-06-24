"use client";
import { createContext, useContext, ReactNode, JSX, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/firebaseDb";

import { useSettings } from "../Settings/useSettings";
import { useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import { useWords } from "../Words/useWords";
import { PhraseCorrection } from "./types";
import { doc, setDoc } from "firebase/firestore";
import { isGoodUserInput } from "./isGoodUserInput";

interface AnalyzeUserMessageInput {
  previousBotMessage: string;
  message: string;
  conversationId: string;
}

interface AnalyzeUserMessageOutput {
  correctedMessage: string;
  description: string;
  sourceMessage: string;
  newWords: string[];
}

interface CorrectionsContextType {
  analyzeUserMessage: (input: AnalyzeUserMessageInput) => Promise<AnalyzeUserMessageOutput>;
  correctionStats: PhraseCorrection[];
}

const CorrectionContext = createContext<CorrectionsContextType | null>(null);

function useProvideCorrections(): CorrectionsContextType {
  const auth = useAuth();
  const settings = useSettings();
  const languageCode = settings.languageCode || "en";
  const correctionStatsDocRef = auth.uid ? db.collections.phraseCorrections(auth.uid) : null;
  const [correctionStats, loading] = useCollectionData(correctionStatsDocRef);
  const textAi = useTextAi();
  const words = useWords();

  const analyzeUserMessage = async (
    input: AnalyzeUserMessageInput
  ): Promise<AnalyzeUserMessageOutput> => {
    try {
      const newWordsStatsRequest = words.addWordsStatFromText(input.message);
      const aiResult = await textAi.generate({
        systemMessage: `You are grammar checker system.
  Student gives a message, your role is to analyze it from the grammar prospective.
  
  Return your result in JSON format.
  Structure of result: {
  "correctedMessage": string,
  "suggestion": string (use ${settings.fullLanguageName || "English"} language)
  }
  
  correctedMessage - return corrected message if need to correct, or return empty string if no correction is needed.
  suggestion: A direct message to the student explaining the corrections or empty string if no correction is needed.
  
  Return info in JSON format.
  Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.
  
  For context, here is the previous bot message: "${input.previousBotMessage}".
  `,
        userMessage: input.message,
        model: MODELS.gpt_4o,
        languageCode,
      });

      const parsedResult = JSON.parse(aiResult);

      const correctedMessage = parsedResult ? (parsedResult?.correctedMessage as string) || "" : "";
      const suggestion = parsedResult ? parsedResult?.suggestion || "" : "";

      const isGood = isGoodUserInput({
        input: input.message,
        correctedMessage,
      });

      if (correctionStatsDocRef && !isGood) {
        const correctionDoc = doc(correctionStatsDocRef);
        const correctionInfo: PhraseCorrection = {
          botMessage: input.previousBotMessage || "",
          userMessage: input.message || "",
          correctedMessage: correctedMessage || "",
          description: suggestion || "",
          languageCode: settings.languageCode || "en",
          conversationId: input.conversationId || "",
          createdAt: Date.now(),
        };
        await setDoc(correctionDoc, correctionInfo);
      }

      return {
        correctedMessage: isGood ? input.message : correctedMessage,
        description: isGood ? "" : suggestion,
        sourceMessage: input.message,
        newWords: await newWordsStatsRequest,
      };
    } catch (error) {
      console.error("Error analyzing message:", error);
      return {
        correctedMessage: "",
        description: "",
        sourceMessage: input.message,
        newWords: [],
      };
    }
  };

  return {
    analyzeUserMessage,
    correctionStats: correctionStats || [],
  };
}

export function CorrectionsProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideCorrections();
  return <CorrectionContext.Provider value={hook}>{children}</CorrectionContext.Provider>;
}

export const useCorrections = (): CorrectionsContextType => {
  const context = useContext(CorrectionContext);
  if (!context) {
    throw new Error("useCorrections must be used within a UsageProvider");
  }
  return context;
};
