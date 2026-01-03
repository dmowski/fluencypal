import { useGame } from "../Game/useGame";
import { useUsage } from "./useUsage";

export const useAccess = () => {
  const game = useGame();
  const usage = useUsage();

  return {
    isFullAppAccess: false, //game.isGameWinner || usage.isFullAccess,
  };
};
