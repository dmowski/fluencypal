import { isFluencyCallPassActive } from '../FluencyCall/pricing';

/** Community messages stay open for practice members, game winners, and an active Group conversations pass. */
export const canReadCommunityMessages = ({
  canUseCommunity,
  isFullAccess,
  isGameWinner,
  groupConversationsUntilIso,
  now,
}: {
  canUseCommunity: boolean;
  isFullAccess: boolean;
  isGameWinner: boolean;
  groupConversationsUntilIso?: string | null;
  now: Date;
}) =>
  canUseCommunity &&
  (isFullAccess || isGameWinner || isFluencyCallPassActive(groupConversationsUntilIso, now));
