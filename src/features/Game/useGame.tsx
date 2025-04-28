"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { GameProfile, GameQuestionShort, UsersStat } from "./types";
import {
  getGameQuestionsRequest,
  getMyProfileRequest,
  getSortedStats,
  getSortedStatsFromData,
  submitAnswerRequest,
} from "@/app/api/game/gameRequests";
import { usePathname } from "next/navigation";
import { parseLangFromUrl } from "../Lang/parseLangFromUrl";
import { useLocalStorage } from "react-use";
import { SupportedLanguage } from "../Lang/lang";
import { useSettings } from "../Settings/useSettings";
import { shuffleArray } from "@/libs/array";

interface GameContextType {
  loadingProfile: boolean;
  stats: UsersStat[];
  myProfile: GameProfile | null;
  loadingQuestions: boolean;
  generateQuestions: () => Promise<void>;
  questions: GameQuestionShort[];
  activeQuestion: GameQuestionShort | null;
  submitAnswer: (questionId: string, answer: string) => Promise<boolean>;
  nextQuestion: () => void;

  nativeLanguageCode: SupportedLanguage | null;
  setNativeLanguageCode: (lang: SupportedLanguage) => void;
}

const GameContext = createContext<GameContextType | null>(null);

function useProvideGame(): GameContextType {
  const auth = useAuth();
  const settings = useSettings();
  const [myProfile, setMyProfile] = useState<GameProfile | null>(null);
  const [stats, setStats] = useState<UsersStat[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<GameQuestionShort[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<GameQuestionShort | null>(null);
  const pathname = usePathname();

  const nativeLanguageCodeFromUrl = useMemo(() => parseLangFromUrl(pathname), [pathname]);
  const [nativeLanguageCode, setNativeLanguageCode] =
    useLocalStorage<SupportedLanguage>("gameNativeLanguage_2");

  useEffect(() => {
    if (
      settings.languageCode &&
      settings.languageCode !== nativeLanguageCodeFromUrl &&
      !nativeLanguageCode
    ) {
      setNativeLanguageCode(nativeLanguageCodeFromUrl);
    }
  }, [nativeLanguageCodeFromUrl, settings.languageCode]);

  const userId = auth.uid;

  const getMyProfile = async () => {
    const response = await getMyProfileRequest(await auth.getToken());
    setMyProfile(response);
  };

  const getStats = async () => {
    const userStats = await getSortedStats();
    setStats(userStats);
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    const generatedQuestions = await getGameQuestionsRequest(
      {
        nativeLanguageCode: nativeLanguageCode || nativeLanguageCodeFromUrl,
      },
      await auth.getToken()
    );
    setLoadingQuestions(false);
    setQuestions(generatedQuestions);
    setActiveQuestion(generatedQuestions[0] || null);
  };

  useEffect(() => {
    if (userId) {
      getMyProfile().then(async () => {
        await getStats();
        setLoadingProfile(false);
      });
    }
  }, [userId]);

  const submitAnswer = async (questionId: string, answer: string) => {
    const response = await submitAnswerRequest(
      {
        questionId,
        answer,
      },
      await auth.getToken()
    );
    const isCorrect = response.isCorrect;
    if (isCorrect) {
      const newQuestions = questions.filter((question) => question.id !== questionId);
      setQuestions(newQuestions);
    }
    const updatedRate = getSortedStatsFromData(response.updatedUserPoints);
    setStats(updatedRate);
    return isCorrect;
  };

  const nextQuestion = () => {
    const randomArray = shuffleArray(questions).filter(
      (question) => question.id !== activeQuestion?.id
    );
    const nextQuestion = randomArray[0] || null;
    setActiveQuestion(nextQuestion);
  };

  return {
    loadingProfile,
    nextQuestion,
    submitAnswer,
    myProfile,
    stats,
    questions,
    loadingQuestions,
    generateQuestions,
    activeQuestion,

    nativeLanguageCode: nativeLanguageCode || null,
    setNativeLanguageCode,
  };
}

export function GameProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideGame();
  return <GameContext.Provider value={hook}>{children}</GameContext.Provider>;
}

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a UsageProvider");
  }
  return context;
};
