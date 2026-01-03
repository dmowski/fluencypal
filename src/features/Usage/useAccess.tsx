import { useGame } from "../Game/useGame";
import { useUsage } from "./useUsage";

export const useAccess = () => {
  const game = useGame();
  const usage = useUsage();

  return {
    isFullAppAccess: game.isGameWinner || usage.isFullAccess,
  };
};
