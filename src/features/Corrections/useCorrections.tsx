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
import { DailyQuestion } from "../Game/DailyQuestion/types";

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

interface AnalyzeDailyQuestionAnswerInput {
  question: DailyQuestion;
  userAnswer: string;
}

interface AnalyzeDailyQuestionAnswerOutput {
  suggestedMessage: string;
  sourceMessage: string;
  newWords: string[];
  rate: number | null;
}

interface CorrectionsContextType {
  analyzeUserMessage: (input: AnalyzeUserMessageInput) => Promise<AnalyzeUserMessageOutput>;
  analyzeDailyQuestionAnswerMessage: (
    input: AnalyzeDailyQuestionAnswerInput
  ) => Promise<AnalyzeDailyQuestionAnswerOutput>;
  correctionStats: PhraseCorrection[];
}

const CorrectionContext = createContext<CorrectionsContextType | null>(null);

function useProvideCorrections(): CorrectionsContextType {
  const auth = useAuth();
  const settings = useSettings();
  const correctionStatsDocRef = auth.uid ? db.collections.phraseCorrections(auth.uid) : null;
  const [correctionStats, loading] = useCollectionData(correctionStatsDocRef);
  const textAi = useTextAi();
  const words = useWords();

  const analyzeDailyQuestionAnswerMessage = async (
    input: AnalyzeDailyQuestionAnswerInput
  ): Promise<AnalyzeDailyQuestionAnswerOutput> => {
    try {
      const newWordsStatsRequest = words.addWordsStatFromText(input.userAnswer);
      const parsedResult = await textAi.generateJson<{
        suggestedMessage: string;
        rate: number;
      }>({
        systemMessage: `You are a helpful assistant that helps to improve student's answers.
Student gives you an answer to a question, your role is to analyze it from the grammar prospective and suggest improved version of the answer. This is transcription of user's voice answer, do not focus on punctuation mistakes.

Return your result in JSON format.
Structure of result: {
"rate": number (1-10, where 10 is best),
"suggestedMessage": string (use ${settings.fullLanguageName || "English"} language)
}

suggestedMessage - return improved message if need to improve, or return empty string if no improvement is needed.

Return info in JSON format.
Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.

For context, here is the question: "${input.question.title}. ${input.question.description}".
  `,
        userMessage: input.userAnswer,
        model: MODELS.gpt_4o,
        attempts: 3,
      });

      const suggestedMessage = parsedResult ? (parsedResult?.suggestedMessage as string) || "" : "";
      return {
        suggestedMessage: suggestedMessage || input.userAnswer,
        sourceMessage: input.userAnswer,
        newWords: await newWordsStatsRequest,
        rate: parsedResult.rate || null,
      };
    } catch (error) {
      console.error("Error analyzing daily question answer message:", error);
      return {
        suggestedMessage: "",
        sourceMessage: input.userAnswer,
        newWords: [],
        rate: null,
      };
    }
  };

  const analyzeUserMessage = async (
    input: AnalyzeUserMessageInput
  ): Promise<AnalyzeUserMessageOutput> => {
    try {
      const newWordsStatsRequest = words.addWordsStatFromText(input.message);
      const parsedResult = await textAi.generateJson<{
        suggestion: string;
        correctedMessage: string;
      }>({
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
        attempts: 3,
      });

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
          createdAtIso: new Date().toISOString(),
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
    analyzeDailyQuestionAnswerMessage,
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
