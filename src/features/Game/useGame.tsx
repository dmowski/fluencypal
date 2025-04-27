"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { TextAiModel } from "@/common/ai";
import { useUsage } from "../Usage/useUsage";
import { getDataFromCache, setDataToCache } from "@/libs/localStorageCache";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/features/Lang/lang";

interface GameContextType {
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

function useProvideGame(): GameContextType {
  const usage = useUsage();
  const auth = useAuth();
  const settings = useSettings();

  return {
    isLoading: false,
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
