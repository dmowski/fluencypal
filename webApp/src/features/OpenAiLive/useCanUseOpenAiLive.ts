'use client';

import { useAuth } from '@/features/Auth/useAuth';
import { useGame } from '@/features/Game/useGame';
import { useUsage } from '@/features/Usage/useUsage';

export const useCanUseOpenAiLive = () => {
  const auth = useAuth();
  const game = useGame();
  const usage = useUsage();
  const signedOut = !auth.loading && !auth.uid;
  const usageReady = signedOut || !usage.loading;
  const gameReady = signedOut || !game.isLoading;
  const canUse =
    !signedOut && ((usageReady && usage.isFullAccess) || (gameReady && game.isGameWinner));

  return {
    canUse,
    loading: auth.loading || (!canUse && (!usageReady || !gameReady)),
  };
};
