"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";

import { GameProfile, UsersStat } from "./types";
import { getMyProfileRequest, getSortedStats } from "@/app/api/game/gameRequests";

interface GameContextType {
  loadingProfile: boolean;
  stats: UsersStat[];
  myProfile: GameProfile | null;
}

const GameContext = createContext<GameContextType | null>(null);

function useProvideGame(): GameContextType {
  const auth = useAuth();
  const [myProfile, setMyProfile] = useState<GameProfile | null>(null);
  const [stats, setStats] = useState<UsersStat[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const userId = auth.uid;

  const getMyProfile = async () => {
    const response = await getMyProfileRequest(await auth.getToken());
    setMyProfile(response);
  };

  const getStats = async () => {
    const userStats = await getSortedStats();
    setStats(userStats);
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
