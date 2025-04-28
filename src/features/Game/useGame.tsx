"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";

import { GameProfile, GameQuestionShort, UsersStat } from "./types";
import {
  getGameQuestionsRequest,
  getMyProfileRequest,
  getSortedStats,
} from "@/app/api/game/gameRequests";
import { usePathname } from "next/navigation";
import { parseLangFromUrl } from "../Lang/parseLangFromUrl";
import { useLocalStorage } from "react-use";
import { SupportedLanguage } from "../Lang/lang";
import { useSettings } from "../Settings/useSettings";

interface GameContextType {
  loadingProfile: boolean;
  stats: UsersStat[];
  myProfile: GameProfile | null;
  loadingQuestions: boolean;
  generateQuestions: () => Promise<void>;
  questions: GameQuestionShort[];
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
  };

  useEffect(() => {
    if (userId) {
      getMyProfile().then(async () => {
        await getStats();
        setLoadingProfile(false);
      });
    }
  }, [userId]);

  return {
    loadingProfile,
    myProfile,
    stats,
    questions,
    loadingQuestions,
    generateQuestions,

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
