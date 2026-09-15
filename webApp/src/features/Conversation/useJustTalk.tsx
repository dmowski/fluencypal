import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';
import { RealTimeModel } from '../Ai/ai';
import { useAuth } from '../Auth/useAuth';
import { readPendingTeacherVoice } from '@/features/Goal/Quiz/pendingTeacherVoice';

export type StartJustTalkResult = 'started' | 'mic-denied' | 'busy';

export const useJustTalk = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const auth = useAuth();
  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const audio = useConversationAudio();
  const { requestMicrophoneWithConsent } = useMicrophonePermission();
  const voiceName =
    settings.userSettings?.teacherVoice || readPendingTeacherVoice() || 'shimmer';
  const startJustTalk = async (
    model?: RealTimeModel,
    options?: { skipConsentUi?: boolean },
  ): Promise<StartJustTalkResult> => {
    if (isCallStarting) return 'busy';
    setIsCallStarting(true);

    try {
      await auth.ensureAnonymousAuth();
      await audio.initAudio();
      const mediaStream = options?.skipConsentUi
        ? await getMediaAudioStreams()
        : await requestMicrophoneWithConsent();
      if (!mediaStream) {
        return 'mic-denied';
      }

      await getMediaVideoStreams();
      if (auth.isIdentified) {
        await settings.setConversationMode('call');
      }
      await conversation.startConversation({
        conversationMode: 'call',
        mode: 'talk',
        voice: voiceName,
        model,
      });
      return 'started';
    } catch (e) {
      console.warn('Microphone permission denied. error', e);
      if (!options?.skipConsentUi) {
        alert(
          i18n._(
            `Microphone access is required to start the call.
Please allow microphone permission in your browser settings, refresh the page, and try again.`,
          ),
        );
      }
      conversation.setIsStarted(false);
      return 'mic-denied';
    } finally {
      setIsCallStarting(false);
    }
  };

  return {
    startJustTalk,
    isCallStarting,
  };
};
