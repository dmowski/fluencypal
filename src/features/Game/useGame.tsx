"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { GameProfile, GameQuestionShort, UsersStat } from "./types";
import {
  getGameQuestionsRequest,
  getMyProfileRequest,
  getSortedStatsFromData,
  submitAnswerRequest,
  updateUserProfileRequest,
} from "@/features/Game/gameBackendRequests";
import { usePathname } from "next/navigation";
import { parseLangFromUrl } from "../Lang/parseLangFromUrl";
import { useLocalStorage } from "react-use";
import { SupportedLanguage } from "../Lang/lang";
import { useSettings } from "../Settings/useSettings";
import { shuffleArray } from "@/libs/array";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";

interface GameContextType {
  loadingProfile: boolean;
  stats: UsersStat[];
  myProfile: GameProfile | null;
  loadingQuestions: boolean;
  generateQuestions: () => Promise<void>;
  questions: GameQuestionShort[];
  activeQuestion: GameQuestionShort | null;
  submitAnswer: (
    questionId: string,
    answer: string
  ) => Promise<{ isCorrect: boolean; description: string | null }>;
  nextQuestion: () => void;

  nativeLanguageCode: SupportedLanguage | null;
  setNativeLanguageCode: (lang: SupportedLanguage) => void;
  myPosition: number | null;
  isGameWinner: boolean;
  updateUsername: (username: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

function useProvideGame(): GameContextType {
  const auth = useAuth();
  const settings = useSettings();
  const [myProfile, setMyProfile] = useState<GameProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<GameQuestionShort[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<GameQuestionShort | null>(null);
  const pathname = usePathname();

  const [gameRate] = useDocumentData(db.documents.gameRate);
  const stats = useMemo(() => {
    if (!gameRate) return [];
    return getSortedStatsFromData(gameRate);
  }, [gameRate]);

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

  const loadMoreQuestions = async () => {
    const generatedQuestions = await getGameQuestionsRequest(
      {
        nativeLanguageCode: nativeLanguageCode || nativeLanguageCodeFromUrl,
      },
      await auth.getToken()
    );

    const uniqQuestions = generatedQuestions.filter(
      (question) => !questions.some((q) => q.id === question.id)
    );

    console.log("uniqQuestions", uniqQuestions);
    setQuestions(uniqQuestions);
    setActiveQuestion((prev) => {
      if (prev) return prev;
      const randomArray = shuffleArray(uniqQuestions);
      const nextQuestion = randomArray[0] || null;
      return nextQuestion;
    });
  };

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    await loadMoreQuestions();
    setLoadingQuestions(false);
  };

  useEffect(() => {
    if (userId) {
      getMyProfile().then(async () => {
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
    const description = response.description;
    if (isCorrect) {
      const newQuestions = questions.filter((question) => question.id !== questionId);
      setQuestions(newQuestions);
      const isFewQuestions = newQuestions.length < 10;
      if (isFewQuestions) {
        loadMoreQuestions();
      }
    }
    return { isCorrect, description };
  };

  const nextQuestion = () => {
    const randomArray = shuffleArray(questions).filter(
      (question) => question.id !== activeQuestion?.id
    );
    const nextQuestion = randomArray[0] || null;
    setActiveQuestion(nextQuestion);
  };

  const myPosition = useMemo(() => {
    if (!myProfile) return null;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return null;
    const myIndex = stats.findIndex((stat) => stat.username === myStat.username);
    return myIndex + 1;
  }, [myProfile, stats]);

  const isTop5Position = useMemo(() => {
    if (!myProfile) return false;
    const myStat = stats.find((stat) => stat.username === myProfile.username);
    if (!myStat) return false;
    const myIndex = stats.findIndex((stat) => stat.username === myStat.username);
    return myIndex < 5;
  }, [myProfile, stats]);

  const updateUsername = async (username: string) => {
    if (!userId) return;

    const response = await updateUserProfileRequest(
      {
        username,
      },
      await auth.getToken()
    );

    if (response.isUpdated) {
      setMyProfile((prev) => {
        if (!prev) return null;
        return { ...prev, username };
      });
    } else {
      console.log("Failed to update username:", response.error);
      alert(response.error || "Failed to update username");
    }
  };

  return {
    isGameWinner: isTop5Position,
    loadingProfile,
    myPosition,
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
    updateUsername,
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
