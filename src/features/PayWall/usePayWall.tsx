"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useRef } from "react";
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

  const isNeedToShowPayWall = useRef(false);
  isNeedToShowPayWall.current =
    usage.balanceHours <= 0.01 && !usage.isFullAccess && !game.isGameWinner;

  useEffect(() => {
    if (usage.loading || game.isLoading) {
      return;
    }

    if (isShowPayWall === false && isNeedToShowPayWall.current) {
      setIsShowPayWall(true);
    }

    if (isShowPayWall === true && !isNeedToShowPayWall.current) {
      setIsShowPayWall(false);
    }
  }, [usage.loading, usage.isFullAccess, usage.balanceHours, game.isGameWinner, game.myPoints]);

  const togglePayWall = () => {
    setIsShowPayWall((prev) => !prev);
  };

  const temporaryClosePayWall = () => {
    setIsShowPayWall(false);
    setTimeout(() => {
      if (isNeedToShowPayWall.current) {
        console.log("Setting paywall back to true");
        setIsShowPayWall(true);
      } else {
        console.log("Not setting paywall back to true, conditions not met");
      }
    }, 20_000);
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
