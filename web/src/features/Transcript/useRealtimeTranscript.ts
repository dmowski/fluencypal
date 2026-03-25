import { useState } from 'react';
import {
  ConversationConfig,
  ConversationInstance,
} from '../Conversation/ConversationInstance/types';
import { MODELS, pricePerHourUsd } from '../Ai/ai';
import { useSettings } from '../Settings/useSettings';
import { useAuth } from '../Auth/useAuth';
import { initWebRtcConversation } from '../Conversation/ConversationInstance/webRtc';
import { closeAudioMediaStream } from '../webCam/mediaStream';

export const useRealtimeTranscript = () => {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [aiHelperMessage, setAiHelperMessage] = useState<string>('');

  const settings = useSettings();
  const auth = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const getBaseRtcConfig = (conversationId: string, instruction: string) => {
    const baseConfig: ConversationConfig = {
      model: MODELS.REALTIME_CONVERSATION,
      initInstruction: instruction,
      onOpen: () => {
        console.log('Open');
        setIsActive(true);
        setIsActivating(false);
      },
      onMessage: (message) => {
        console.log('Message', message);
        if (message.isBot) {
          setAiHelperMessage(message.text);
        } else {
          setTranscript((prev) => [message.text]);
        }
      },
      onAddDelta: (id, delta, isBot) => {
        console.log('Add Delta', { id, delta, isBot });
      },
      setIsAiSpeaking: () => {},
      setIsUserSpeaking: () => {},
      isMuted: false,
      isVolumeOn: true,
      onAddUsage: () => {},
      languageCode: settings.languageCode || 'en',

      getAuthToken: () => auth.getToken(),
      onMessageOrder: (order) => {
        console.log('onMessageOrder', order);
      },
      generateTextWithAi: async ({ userMessage, systemMessage }) => {
        return '';
      },
      playAudio: async (textToPlay: string) => {
        console.log('Play audio', textToPlay);
      },
      conversationId: conversationId,
      userPricePerHourUsd: pricePerHourUsd,
    };
    return baseConfig;
  };

  const [conversation, setConversation] = useState<ConversationInstance | null>(null);

  const start = async ({ instruction }: { instruction: string }) => {
    if (conversation) {
      console.warn('Conversation already started');
      return;
    }
    setIsActive(false);
    setIsActivating(true);
    setTranscript([]);
    setAiHelperMessage('');

    const conversationId = `transcript-${Date.now()}`;
    const config = getBaseRtcConfig(conversationId, instruction);

    const conversationInstance = await initWebRtcConversation(config);
    setConversation(conversationInstance);
  };

  const stop = () => {
    setIsActivating(false);
    setIsActive(false);
    conversation?.closeHandler();
    setConversation(null);
    closeAudioMediaStream();
  };

  return {
    transcript,
    start,
    stop,
    clear: () => setTranscript([]),
    isActivating,
    isActive,
    aiHelperMessage,
  };
};
