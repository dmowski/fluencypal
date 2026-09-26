import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useRef, useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';
import { RealTimeModel } from '../Ai/ai';
import { useAuth } from '../Auth/useAuth';
import { getDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/features/Firebase/firebaseDb';
import { ConversationType } from './conversation';
import { SupportedLanguage } from '@/features/Lang/lang';
import { GoalPlan } from '@/features/Plan/types';
import { useAccess } from '@/features/Usage/useAccess';
import {
  firstPlanElement,
  isFirstPlanLessonUsed,
  readFirstLessonUsed,
} from './firstPlanLesson';
import { JUST_TALK_HANDOFF_PARAM, JUST_TALK_HANDOFF_VALUE } from './justTalkHandoff';
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

export type StartJustTalkResult = 'started' | 'mic-denied' | 'busy' | 'plan-locked';

const loadLatestGoal = async (
  uid: string | undefined,
  languageCode: SupportedLanguage | null | undefined,
): Promise<GoalPlan | null> => {
  const ref = db.collections.goals(uid);
  if (!ref) return null;
  try {
    const snap = await getDocs(ref);
    const goals = snap.docs.map((entry) => entry.data());
    const matching = languageCode
      ? goals.filter((item) => item.languageCode === languageCode)
      : goals;
    const pool = matching.length ? matching : goals;
    pool.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    return pool[0] || null;
  } catch {
    return null;
  }
};

const openPlanLessonOffer = (router: ReturnType<typeof useRouter>) => {
  const params = new URLSearchParams(window.location.search);
  if (params.get(JUST_TALK_HANDOFF_PARAM) === JUST_TALK_HANDOFF_VALUE) return;
  params.set(JUST_TALK_HANDOFF_PARAM, JUST_TALK_HANDOFF_VALUE);
  router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
};

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
  const access = useAccess();
  const router = useRouter();
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
      const goalPlan = await loadLatestGoal(uid, setup.language);
      if (!stillCurrent()) return 'busy';
      const firstLesson = firstPlanElement(goalPlan);
      if (!access.isFullAppAccess && (readFirstLessonUsed() || isFirstPlanLessonUsed(goalPlan))) {
        openPlanLessonOffer(router);
        return 'plan-locked';
      }
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
        goal:
          mode === 'quiz-talk' && goalPlan && firstLesson
            ? { goalPlan, goalElement: firstLesson }
            : undefined,
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
