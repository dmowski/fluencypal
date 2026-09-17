import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';
import { RealTimeModel } from '../Ai/ai';
import { useAuth } from '../Auth/useAuth';
import {
  consumeJustTalkAutoStart,
  readJustTalkAutoStart,
  resolveJustTalkCallSetup,
} from './justTalkHandoff';

export type StartJustTalkResult = 'started' | 'mic-denied' | 'busy';

export const useJustTalk = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const auth = useAuth();
  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const audio = useConversationAudio();
  const { requestMicrophoneWithConsent } = useMicrophonePermission();
  const startJustTalk = async (
    model?: RealTimeModel,
    options?: { skipConsentUi?: boolean },
  ): Promise<StartJustTalkResult> => {
    if (isCallStarting) return 'busy';
    setIsCallStarting(true);
    const autoStartPrefs = readJustTalkAutoStart();
    const setup = resolveJustTalkCallSetup({
      prefs: autoStartPrefs,
      settingsVoice: settings.userSettings?.teacherVoice,
      settingsLanguage: settings.languageCode,
    });

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
      await settings.setConversationMode('call');
      await conversation.startConversation({
        conversationMode: 'call',
        mode: 'talk',
        voice: setup.voice,
        languageCode: setup.language || undefined,
        startUnmuted: setup.startUnmuted,
        model,
      });
      if (autoStartPrefs) {
        consumeJustTalkAutoStart();
      }
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
