import dayjs from 'dayjs';
import { useGame } from '../Game/useGame';
import { useUsage } from './useUsage';
import { useSettings } from '../Settings/useSettings';
import { useDailyTasks } from '../Tasks/useDailyTasks';
import { useAuth } from '../Auth/useAuth';

export const useAccess = () => {
  const game = useGame();
  const usage = useUsage();
  const settings = useSettings();
  const dailyTasks = useDailyTasks();
  const auth = useAuth();
  const isAllDailyTasksCompleted = dailyTasks.isAllTasksCompleted;

  const isParentalConsentNeeded = settings.userSettings?.isParentalConsentNeeded || false;
  const isCreditCardValidated = settings.userSettings?.isCreditCardConfirmed;
  const isConsentGiven =
    settings.userSettings?.parentalConsent?.consentGivenAtIso && isCreditCardValidated;

  const canUseCommunity = isParentalConsentNeeded ? false : true;
  const communityAccessLoading =
    auth.loading || (auth.isIdentified && (usage.loading || game.isLoading));
  const canReadCommunity = canUseCommunity && (usage.isFullAccess || game.isGameWinner);

  const isExpiringSoon = game.isGameWinner
    ? false
    : !usage.activeSubscriptionTill
      ? false
      : dayjs(usage.activeSubscriptionTill).diff(dayjs(), 'hour') <= 5;

  return {
    isFullAppAccess: game.isGameWinner || usage.isFullAccess || isAllDailyTasksCompleted,
    isExpiringSoon,
    activeSubscriptionTill: usage.activeSubscriptionTill,
    showPaymentModal: () => usage.togglePaymentModal(true),

    isBlockedByAge: isParentalConsentNeeded ? !isConsentGiven : false,
    canUseCommunity,
    canReadCommunity,
    communityAccessLoading,
    canAccessSpaces: true,
    isAge18PlusConfirmed:
      isConsentGiven || isCreditCardValidated || !!settings.userSettings?.age18PlusConfirmedAtIso,
  };
};
