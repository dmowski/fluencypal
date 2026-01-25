import dayjs from 'dayjs';
import { useGame } from '../Game/useGame';
import { useUsage } from './useUsage';

export const useAccess = () => {
  const game = useGame();
  const usage = useUsage();

  const isExpiringSoon = game.isGameWinner
    ? false
    : !usage.activeSubscriptionTill
      ? false
      : dayjs(usage.activeSubscriptionTill).diff(dayjs(), 'hour') <= 5;

  return {
    isFullAppAccess: game.isGameWinner || usage.isFullAccess,
    isExpiringSoon,
    activeSubscriptionTill: usage.activeSubscriptionTill,
    showPaymentModal: () => usage.togglePaymentModal(true),
  };
};
