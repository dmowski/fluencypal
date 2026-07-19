import { ConversationMessage } from '@/features/Conversation/conversation';
import { RefObject, useEffect, useRef } from 'react';
import { ConversationInstance } from '../ConversationInstance/types';
import { useAccess } from '@/features/Usage/useAccess';
import { isAliasGameSession, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';

const LIMITED_MESSAGES_COUNT = 600;
const LIMITED_VOICE_MESSAGES_COUNT = 5000;

export const useLimits = (
  communicatorRef: RefObject<ConversationInstance | undefined>,
  conversation: ConversationMessage[],
  toggleMute: (mute: boolean) => void,
  toggleVolume: (enable: boolean) => void,
) => {
  const access = useAccess();

  const isLimitedRecording = access.isFullAppAccess
    ? false
    : conversation.length >= LIMITED_MESSAGES_COUNT;
  const isLimitedAiVoice =
    !access.isFullAppAccess && conversation.length >= LIMITED_VOICE_MESSAGES_COUNT;
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
  };
};
