'use client';

import { useAccess } from '@/features/Usage/useAccess';

export function useFluencyCallAccess() {
  const access = useAccess();

  return {
    canJoin: access.canUseCommunity,
    ready: !access.communityAccessLoading,
  };
}
