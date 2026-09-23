import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useRef, useState } from 'react';
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
import {
  beginJustTalkStart,
  finishJustTalkStart,
  isJustTalkStartCurrent,
  JustTalkStartGate,
} from './justTalkStartGate';

export type StartJustTalkResult = 'started' | 'mic-denied' | 'busy';

export type StartJustTalkOptions = {
  skipConsentUi?: boolean;
  /** Quiz handoff only. Dashboard Just Talk stays `talk`. */
  mode?: Extract<ConversationType, 'talk' | 'quiz-talk'>;
  /**
   * Enable-mic tap. Replaces an in-flight auto-start that has not reached the call,
   * so getUserMedia runs inside the user gesture.
   */
  supersede?: boolean;
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
  const startGateRef = useRef<JustTalkStartGate>({ attempt: 0 });
  const audio = useConversationAudio();
  const { requestMicrophoneWithConsent } = useMicrophonePermission();
  const startJustTalk = async (
    model?: RealTimeModel,
    options?: StartJustTalkOptions,
  ): Promise<StartJustTalkResult> => {
    const attempt = beginJustTalkStart(startGateRef.current, Boolean(options?.supersede));
    if (attempt === null) return 'busy';
    setIsCallStarting(true);
    const autoStartPrefs = readJustTalkAutoStart();
    const setup = resolveJustTalkCallSetup({
      prefs: autoStartPrefs,
      settingsVoice: settings.voice,
      settingsLanguage: settings.languageCode,
    });
    const mode = options?.mode || 'talk';
    const stillCurrent = () => isJustTalkStartCurrent(startGateRef.current, attempt);

    try {
      const uid = await auth.ensureAnonymousAuth();
      if (!stillCurrent()) return 'busy';
      await audio.initAudio();
      if (!stillCurrent()) return 'busy';
      const mediaStream = options?.skipConsentUi
        ? await getMediaAudioStreams()
        : await requestMicrophoneWithConsent();
      if (!stillCurrent()) return 'busy';
      if (!mediaStream) {
        return 'mic-denied';
      }

      await getMediaVideoStreams();
      if (!stillCurrent()) return 'busy';
      await settings.setConversationMode('call');
      if (!stillCurrent()) return 'busy';
      const aboutUserTranscription =
        mode === 'quiz-talk'
          ? await loadQuizTalkAbout({
              uid,
              languageCode: setup.language,
            })
          : undefined;
      if (!stillCurrent()) return 'busy';
      await conversation.startConversation({
        conversationMode: 'call',
        mode,
        voice: setup.voice,
        languageCode: setup.language || undefined,
        startUnmuted: setup.startUnmuted,
        model,
        aboutUserTranscription,
      });
      if (!stillCurrent()) return 'busy';
      if (autoStartPrefs) {
        consumeJustTalkAutoStart();
      }
      return 'started';
    } catch (e) {
      if (!stillCurrent()) return 'busy';
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
      if (finishJustTalkStart(startGateRef.current, attempt)) {
        setIsCallStarting(false);
      }
    }
  };

  return {
    startJustTalk,
    isCallStarting,
  };
};
