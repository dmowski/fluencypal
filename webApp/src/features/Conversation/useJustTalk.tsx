import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaVideoStreams } from '../webCam/mediaStream';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';
import { RealTimeModel } from '../Ai/ai';

export const useJustTalk = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const audio = useConversationAudio();
  const { requestMicrophoneWithConsent } = useMicrophonePermission();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const startJustTalk = async (model?: RealTimeModel) => {
    if (isCallStarting) return;
    await audio.initAudio();
    setIsCallStarting(true);

    try {
      const mediaStream = await requestMicrophoneWithConsent();
      if (!mediaStream) {
        setIsCallStarting(false);
        return;
      }

      await getMediaVideoStreams();
    } catch (e) {
      console.warn('Microphone permission denied. error', e);
      alert(
        i18n._(
          `Microphone access is required to start the call.
Please allow microphone permission in your browser settings, refresh the page, and try again.`,
        ),
      );
      setIsCallStarting(false);
      return;
    }

    await settings.setConversationMode('call');
    conversation.startConversation({
      conversationMode: 'call',
      mode: 'talk',
      voice: voiceName,
      model,
    });
  };

  return {
    startJustTalk,
    isCallStarting,
  };
};
