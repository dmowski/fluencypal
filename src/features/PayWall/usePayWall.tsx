"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect } from "react";
import { useGame } from "../Game/useGame";
import { useUsage } from "../Usage/useUsage";

interface PayWallContextType {
  isShowPayWall: boolean;
  togglePayWall: () => void;
  temporaryClosePayWall: () => void;
}

export const payWallContext = createContext<PayWallContextType>({
  isShowPayWall: false,
  togglePayWall: () => {
    console.warn("togglePayWall function is not implemented");
  },
  temporaryClosePayWall: () => {
    console.warn("temporaryClosePayWall function is not implemented");
  },
});

function useProvidePayWall(): PayWallContextType {
  const game = useGame();
  const usage = useUsage();

  const [isShowPayWall, setIsShowPayWall] = useState(false);

  const isNeedToShowPayWall =
    usage.balanceHours <= 0.01 && !usage.isFullAccess && !game.isGameWinner;

  useEffect(() => {
    if (usage.loading || game.loadingProfile || game.isGameWinner) {
      return;
    }

    if (isShowPayWall === false && !usage.isFullAccess) {
      setIsShowPayWall(true);
    }

    if (isShowPayWall && usage.isFullAccess) {
      setIsShowPayWall(false);
    }
  }, [usage.loading, usage.isFullAccess, game.isGameWinner, game.loadingProfile]);

  const togglePayWall = () => {
    setIsShowPayWall((prev) => !prev);
  };

  const temporaryClosePayWall = () => {
    setIsShowPayWall(false);
    setTimeout(() => {
      if (isNeedToShowPayWall) {
        setIsShowPayWall(true);
      }
    }, 13_000);
  };

  return {
    isShowPayWall,
    togglePayWall,
    temporaryClosePayWall,
  };
}

export function PayWallProvider({ children }: { children: ReactNode }): JSX.Element {
  const settings = useProvidePayWall();

  return <payWallContext.Provider value={settings}>{children}</payWallContext.Provider>;
}

export const usePayWall = (): PayWallContextType => {
  const context = useContext(payWallContext);
  if (!context) {
    throw new Error("usePayWall must be used within a PayWallProvider");
  }
  return context;
};
