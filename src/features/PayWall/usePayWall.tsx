"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useRef } from "react";
import { useGame } from "../Game/useGame";
import { useUsage } from "../Usage/useUsage";
import { useAiConversation } from "../Conversation/useAiConversation";

interface PayWallContextType {
  isShowPayWall: boolean;
  temporaryClosePayWall: () => void;
}

export const payWallContext = createContext<PayWallContextType>({
  isShowPayWall: false,
  temporaryClosePayWall: () => {
    console.warn("temporaryClosePayWall function is not implemented");
  },
});

function useProvidePayWall(): PayWallContextType {
  const game = useGame();
  const usage = useUsage();
  const conversation = useAiConversation();
  const activeConversationMessageCount = conversation.conversation.length;
  const isInPaidArea = activeConversationMessageCount >= 2;

  const [isShowPayWall, setIsShowPayWall] = useState(false);

  const isNeedToShowPayWall = useRef(false);
  isNeedToShowPayWall.current =
    usage.balanceHours <= 0.01 && !usage.isFullAccess && !game.isGameWinner && isInPaidArea;

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
  }, [
    usage.loading,
    usage.isFullAccess,
    usage.balanceHours,
    game.isGameWinner,
    game.myPoints,
    isInPaidArea,
  ]);

  const temporaryClosePayWall = () => {
    setIsShowPayWall(false);
    setTimeout(() => {
      if (isNeedToShowPayWall.current) {
        console.log("Setting paywall back to true");
        setIsShowPayWall(true);
      } else {
        console.log("Not setting paywall back to true, conditions not met");
      }
    }, 30_000);
  };

  return {
    isShowPayWall,
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
