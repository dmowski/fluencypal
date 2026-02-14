import { ConversationMessage } from '@/common/conversation';
import { RefObject, useEffect } from 'react';
import { ConversationInstance } from '../ConversationInstance/types';
import { useAccess } from '@/features/Usage/useAccess';

const LIMITED_MESSAGES_COUNT = 9;
const LIMITED_VOICE_MESSAGES_COUNT = 4;

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
  };
};
