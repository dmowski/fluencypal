import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { unlockAudioPlayback } from './ConversationInstance/realtimeWs/audioUnlock';
import { isExperimentalRealtimeWsConfigured } from './ConversationInstance/realtimeWs/getRealtimeWsUrl';

export const useExperimentalJustTalk = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const audio = useConversationAudio();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';

  const startExperimentalJustTalk = async () => {
    if (isCallStarting) return;

    if (!isExperimentalRealtimeWsConfigured()) {
      alert(
        i18n._(
          'Custom realtime is not configured. Set NEXT_PUBLIC_REALTIME_WS_URL_PROD (pnpm dev:prod) or NEXT_PUBLIC_REALTIME_WS_URL_DEV (pnpm dev) in .env.local and reload.',
        ),
      );
      return;
    }

    await audio.initAudio();
    await unlockAudioPlayback();
    setIsCallStarting(true);

    try {
      const mediaStream = await getMediaAudioStreams();
      if (!mediaStream) {
        throw new Error('Could not access microphone');
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
    try {
      await conversation.startConversation({
        conversationMode: 'call',
        mode: 'talk',
        voice: voiceName,
        experimentalRealtimeWs: true,
      });
    } finally {
      setIsCallStarting(false);
    }
  };

  return {
    startExperimentalJustTalk,
    isCallStarting,
    isConfigured: isExperimentalRealtimeWsConfigured(),
  };
};
