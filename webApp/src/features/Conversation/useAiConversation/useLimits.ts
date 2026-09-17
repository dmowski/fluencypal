import { ConversationMessage } from '@/features/Conversation/conversation';
import { RefObject, useEffect, useRef } from 'react';
import { ConversationInstance } from '../ConversationInstance/types';
import { useAccess } from '@/features/Usage/useAccess';
import { useUsage } from '@/features/Usage/useUsage';
import { hasAdvancedTalkAccess } from '@/features/Usage/advancedUsage';
import { isAliasGameSession, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';
import { useAuth } from '@/features/Auth/useAuth';
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
  const access = useAccess();
  const usage = useUsage();
  const auth = useAuth();
  const hasAccess = isAdvancedConversation
    ? hasAdvancedTalkAccess(usage.advancedBalanceHours || 0)
    : access.isFullAppAccess;

  const isGuestConversationLimited = shouldLimitGuestConversation({
    isIdentified: auth.isIdentified,
    conversation,
  });

  const isFreeTierLimited = isFreeTierUserMessageLimited({
    hasAccess,
    conversation,
  });

  const isLimitedRecording = isGuestConversationLimited || isFreeTierLimited;
  const isLimitedAiVoice = isGuestConversationLimited || isFreeTierLimited;
  const hasTrackedPaywall = useRef(false);

  useEffect(() => {
    if (isLimitedRecording) {
      toggleMute(true);
      if (isAliasGameSession() && !hasTrackedPaywall.current) {
        trackAliasEvent('alias_paywall_viewed');
        hasTrackedPaywall.current = true;
      }
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
