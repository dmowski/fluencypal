"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useAuth } from "../Auth/useAuth";
import { useCollectionData } from "react-firebase-hooks/firestore";
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
  rate: number;
}

interface CorrectionsContextType {
  analyzeUserMessage: (
    input: AnalyzeUserMessageInput,
  ) => Promise<AnalyzeUserMessageOutput>;

  correctionStats: PhraseCorrection[];
}

const CorrectionContext = createContext<CorrectionsContextType | null>(null);

function useProvideCorrections(): CorrectionsContextType {
  const auth = useAuth();
  const settings = useSettings();
  const correctionStatsDocRef = auth.uid
    ? db.collections.phraseCorrections(auth.uid)
    : null;
  const [correctionStats, loading] = useCollectionData(correctionStatsDocRef);
  const textAi = useTextAi();
  const words = useWords();

  const analyzeUserMessage = async (
    input: AnalyzeUserMessageInput,
  ): Promise<AnalyzeUserMessageOutput> => {
    try {
      const newWordsStatsRequest = words.addWordsStatFromText(input.message);

      const fullLanguageName = settings.fullLanguageName || "English";

      const systemMessage = `You are speech checker system.
User gives a audio transcript, your role is to analyze it from the voice speech prospective. 
Do not focus fully on punctuation, because it may be not accurate in the voice to text software, but focus on grammar, style, and natural language flow.

Return your result in JSON format.
Structure of result: {
"correctedMessage": "string. Use ${fullLanguageName} language.",
"suggestion": "string. Use ${fullLanguageName} language.",
"rate": "number (1-10, where 10 is best by style and grammar)"
}

correctedMessage - return corrected message in ${fullLanguageName} language if need to correct, or return empty string if no correction is needed.
suggestion: A direct message to the user explaining one biggest issue in message or empty string if no correction is needed. Be concise and do it in one sentence.
rate: rate the original user input from 1 to 10, where 10 is perfect.

Return info in JSON format.
Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.

${input.previousBotMessage.trim() ? "For context, here is the previous message:" : ""}
${input.previousBotMessage}
`.trim();

      const parsedResult = await textAi.generateJson<{
        suggestion: string;
        correctedMessage: string;
        rate: number;
      }>({
        systemMessage: systemMessage,
        userMessage: input.message,
        model: MODELS.gpt_4o,
        attempts: 3,
      });

      const correctedMessage = parsedResult
        ? (parsedResult?.correctedMessage as string) || ""
        : "";
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
        rate: parsedResult?.rate || 0,
      };
    } catch (error) {
      console.error("Error analyzing message:", error);
      return {
        correctedMessage: "",
        description: "",
        sourceMessage: input.message,
        newWords: [],
        rate: 0,
      };
    }
  };

  return {
    analyzeUserMessage,
    correctionStats: correctionStats || [],
  };
}

export function CorrectionsProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const hook = useProvideCorrections();
  return (
    <CorrectionContext.Provider value={hook}>
      {children}
    </CorrectionContext.Provider>
  );
}

export const useCorrections = (): CorrectionsContextType => {
  const context = useContext(CorrectionContext);
  if (!context) {
    throw new Error("useCorrections must be used within a UsageProvider");
  }
  return context;
};
