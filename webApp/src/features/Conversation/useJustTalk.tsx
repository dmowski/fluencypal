import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';
import { RealTimeModel } from '../Ai/ai';
import { useAuth } from '../Auth/useAuth';
import { getDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { ConversationType } from './conversation';
import { SupportedLanguage } from '@/features/Lang/lang';
import { clipQuizTalkAbout, markQuizTalkAbout, readQuizTalkAbout } from './quizTalk';
import {
  consumeJustTalkAutoStart,
  readJustTalkAutoStart,
  resolveJustTalkCallSetup,
} from './justTalkHandoff';

export type StartJustTalkResult = 'started' | 'mic-denied' | 'busy';

export type StartJustTalkOptions = {
  skipConsentUi?: boolean;
  /** Quiz handoff only. Dashboard Just Talk stays `talk`. */
  mode?: Extract<ConversationType, 'talk' | 'quiz-talk'>;
};

const loadQuizTalkAbout = async ({
  uid,
  languageCode,
}: {
  uid?: string;
  languageCode?: SupportedLanguage | null;
}): Promise<string> => {
  const fromSession = readQuizTalkAbout();
  if (fromSession) return fromSession;
  const ref = db.documents.quizSurvey2(uid, languageCode || undefined);
  if (!ref) return '';
  try {
    const snap = await getDoc(ref);
    const about = clipQuizTalkAbout(snap.data()?.aboutUserTranscription);
    if (about) markQuizTalkAbout(about);
    return about;
  } catch {
    return '';
  }
};

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
    options?: StartJustTalkOptions,
  ): Promise<StartJustTalkResult> => {
    if (isCallStarting) return 'busy';
    setIsCallStarting(true);
    const autoStartPrefs = readJustTalkAutoStart();
    const setup = resolveJustTalkCallSetup({
      prefs: autoStartPrefs,
      settingsVoice: settings.voice,
      settingsLanguage: settings.languageCode,
    });
    const mode = options?.mode || 'talk';

    try {
      const uid = await auth.ensureAnonymousAuth();
      await audio.initAudio();
      const mediaStream = options?.skipConsentUi
        ? await getMediaAudioStreams()
        : await requestMicrophoneWithConsent();
      if (!mediaStream) {
        return 'mic-denied';
      }

      await getMediaVideoStreams();
      await settings.setConversationMode('call');
      const aboutUserTranscription =
        mode === 'quiz-talk'
          ? await loadQuizTalkAbout({
              uid,
              languageCode: setup.language,
            })
          : undefined;
      await conversation.startConversation({
        conversationMode: 'call',
        mode,
        voice: setup.voice,
        languageCode: setup.language || undefined,
        startUnmuted: setup.startUnmuted,
        model,
        aboutUserTranscription,
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
