import dayjs from 'dayjs';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useGame } from '../Game/useGame';
import { useUsage } from './useUsage';
import { useSettings } from '../Settings/useSettings';
import { useDailyTasks } from '../Tasks/useDailyTasks';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { canReadCommunityMessages } from './communityAccess';

export const useAccess = () => {
  const game = useGame();
  const usage = useUsage();
  const settings = useSettings();
  const dailyTasks = useDailyTasks();
  const auth = useAuth();
  const fluencyCallAccountRef = auth.uid ? db.documents.fluencyCallAccount(auth.uid) : null;
  const [fluencyCallAccount, fluencyCallAccountLoading] = useDocumentData(fluencyCallAccountRef);
  const isAllDailyTasksCompleted = dailyTasks.isAllTasksCompleted;

  const isParentalConsentNeeded = settings.userSettings?.isParentalConsentNeeded || false;
  const isCreditCardValidated = settings.userSettings?.isCreditCardConfirmed;
  const isConsentGiven =
    settings.userSettings?.parentalConsent?.consentGivenAtIso && isCreditCardValidated;

  const canUseCommunity = isParentalConsentNeeded ? false : true;
  const communityAccessLoading =
    auth.loading ||
    (auth.isIdentified &&
      (usage.loading || game.isLoading || (Boolean(auth.uid) && fluencyCallAccountLoading)));
  const canReadCommunity = canReadCommunityMessages({
    canUseCommunity,
    isFullAccess: usage.isFullAccess,
    isGameWinner: game.isGameWinner,
    groupConversationsUntilIso: fluencyCallAccount?.activeUntilIso,
    now: new Date(),
  });

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
    fluencyCallActiveUntilIso: fluencyCallAccount?.activeUntilIso ?? null,
    canAccessSpaces: true,
    isAge18PlusConfirmed:
      isConsentGiven || isCreditCardValidated || !!settings.userSettings?.age18PlusConfirmedAtIso,
  };
};
