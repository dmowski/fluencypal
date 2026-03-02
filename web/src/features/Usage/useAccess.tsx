import dayjs from 'dayjs';
import { useGame } from '../Game/useGame';
import { useUsage } from './useUsage';
import { useSettings } from '../Settings/useSettings';
import { useAuth } from '../Auth/useAuth';

export const useAccess = () => {
  const game = useGame();
  const usage = useUsage();
  const settings = useSettings();
  const auth = useAuth();

  const isParentalConsentNeeded = settings.userSettings?.isParentalConsentNeeded || false;
  const isCreditCardValidated = settings.userSettings?.isCreditCardConfirmed;
  const isConsentGiven =
    settings.userSettings?.parentalConsent?.consentGivenAtIso && isCreditCardValidated;

  const canUseCommunity = isParentalConsentNeeded ? false : true;

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

    isBlockedByAge: isParentalConsentNeeded ? !isConsentGiven : false,
    canUseCommunity,
    canAccessSpaces: auth.isFounder,
  };
};
