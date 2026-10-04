'use client';

import { useGame } from '@/features/Game/useGame';
import { useAccess } from '@/features/Usage/useAccess';
import { isFluencyCallPassActive } from './pricing';

export function useFluencyCallAccess(now: Date) {
  const access = useAccess();
  const game = useGame();
  const passActive = isFluencyCallPassActive(access.fluencyCallActiveUntilIso, now);
  const included =
    access.canUseCommunity && (game.isGameWinner || Boolean(access.activeSubscriptionTill));
  const canJoin = included || (access.canUseCommunity && passActive);

  return {
    canJoin,
    included,
    passActive,
    activeUntilIso: access.fluencyCallActiveUntilIso,
    ready: !access.communityAccessLoading,
  };
}
