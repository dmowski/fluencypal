import { ConversationMessage } from '@/features/Conversation/conversation';
import { RefObject, useEffect } from 'react';
import { ConversationInstance } from '../ConversationInstance/types';
import { useUsage } from '@/features/Usage/useUsage';
import { hasAdvancedTalkAccess } from '@/features/Usage/advancedUsage';
import { useAuth } from '@/features/Auth/useAuth';
import { useGame } from '@/features/Game/useGame';
import {
  isFreeTierUserMessageLimited,
  isGuestConversationLimited as shouldLimitGuestConversation,
} from '../guestConversationLimit';

export const useLimits = (
  communicatorRef: RefObject<ConversationInstance | undefined>,
  conversation: ConversationMessage[],
  toggleMute: (mute: boolean) => void,
  toggleVolume: (enable: boolean) => void,
  isAdvancedConversation = false,
) => {
  const usage = useUsage();
  const auth = useAuth();
  const game = useGame();
  const hasFullAccess = isAdvancedConversation
    ? hasAdvancedTalkAccess(usage.advancedBalanceHours || 0)
    : usage.isFullAccess;

  const isGuestConversationLimited = shouldLimitGuestConversation({
    isIdentified: auth.isIdentified,
    conversation,
  });

  const isFreeTierLimited = isFreeTierUserMessageLimited({
    hasFullAccess,
    isGameWinner: game.isGameWinner,
    conversation,
  });

  const isLimitedRecording = isGuestConversationLimited || isFreeTierLimited;
  const isLimitedAiVoice = isGuestConversationLimited || isFreeTierLimited;

  useEffect(() => {
    if (isLimitedRecording) {
      toggleMute(true);
    }
  }, [isLimitedRecording]);

  useEffect(() => {
    if (isLimitedAiVoice) {
      toggleVolume(false);
      communicatorRef.current?.lockVolume();
      return;
    } else {
      communicatorRef.current?.unlockVolume();
      toggleVolume(!isLimitedAiVoice);
    }
  }, [isLimitedAiVoice]);

  return {
    isLimitedAiVoice,
    isLimitedRecording,
    isGuestConversationLimited,
  };
};
