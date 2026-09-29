import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';
import { useAiConversation } from './useAiConversation/useAiConversation';
import { useRef, useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { useMicrophonePermission } from '../webCam/useMicrophonePermission';
import { RealTimeModel } from '../Ai/ai';
import { useAuth } from '../Auth/useAuth';
import {
  beginJustTalkStart,
  finishJustTalkStart,
  isJustTalkStartCurrent,
  JustTalkStartGate,
} from './justTalkStartGate';

export type StartJustTalkResult = 'started' | 'mic-denied' | 'busy';

const logJustTalk = (step: string, details?: Record<string, unknown>) => {
  console.log('[just-talk]', step, {
    href: typeof window === 'undefined' ? '' : window.location.href,
    ...details,
  });
};

const errorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { message: String(error) };
};

export type StartJustTalkOptions = {
  skipConsentUi?: boolean;
  /**
   * Enable-mic tap. Replaces an in-flight auto-start that has not reached the call,
   * so getUserMedia runs inside the user gesture.
   */
  supersede?: boolean;
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
    const supersede = Boolean(options?.supersede);
    const attempt = beginJustTalkStart(startGateRef.current, supersede);
    logJustTalk('start', {
      attempt,
      gate: startGateRef.current.attempt,
      supersede,
      skipConsentUi: Boolean(options?.skipConsentUi),
      model: model || null,
      voice: settings.voice || null,
      language: settings.languageCode || null,
      uid: auth.uid || null,
      isIdentified: auth.isIdentified,
      isAuthorized: auth.isAuthorized,
    });
    if (attempt === null) {
      logJustTalk('busy', { reason: 'start-already-in-flight' });
      return 'busy';
    }
    setIsCallStarting(true);
    const voice = settings.voice || 'shimmer';
    const language = settings.languageCode || null;
    const stillCurrent = (step: string) => {
      const current = isJustTalkStartCurrent(startGateRef.current, attempt);
      if (!current) {
        logJustTalk('busy', {
          reason: 'superseded',
          step,
          attempt,
          gate: startGateRef.current.attempt,
        });
      }
      return current;
    };

    try {
      logJustTalk('auth');
      const uid = await auth.ensureAnonymousAuth();
      logJustTalk('auth-ready', {
        uid: uid || null,
        isIdentified: auth.isIdentified,
        isAnonymous: auth.isAnonymous,
      });
      if (!stillCurrent('auth')) return 'busy';
      logJustTalk('audio-init');
      await audio.initAudio();
      logJustTalk('audio-ready');
      if (!stillCurrent('audio')) return 'busy';
      logJustTalk('mic-request', { skipConsentUi: Boolean(options?.skipConsentUi) });
      const mediaStream = options?.skipConsentUi
        ? await getMediaAudioStreams()
        : await requestMicrophoneWithConsent();
      logJustTalk('mic-result', {
        hasStream: Boolean(mediaStream),
        active: Boolean(mediaStream?.active),
        audioTracks: mediaStream?.getAudioTracks().length ?? 0,
      });
      if (!stillCurrent('mic')) return 'busy';
      if (!mediaStream) {
        logJustTalk('mic-denied', { reason: 'empty-stream' });
        return 'mic-denied';
      }

      logJustTalk('video-request');
      const videoStream = await getMediaVideoStreams();
      logJustTalk('video-result', {
        hasStream: Boolean(videoStream),
        active: Boolean(videoStream?.active),
      });
      if (!stillCurrent('video')) return 'busy';
      logJustTalk('mode-call');
      await settings.setConversationMode('call');
      if (!stillCurrent('mode')) return 'busy';
      logJustTalk('conversation-start', { voice, language, model: model || null });
      await conversation.startConversation({
        conversationMode: 'call',
        mode: 'talk',
        voice,
        languageCode: language || undefined,
        model,
      });
      if (!stillCurrent('conversation')) return 'busy';
      logJustTalk('started', { attempt });
      return 'started';
    } catch (e) {
      logJustTalk('error', { attempt, ...errorDetails(e) });
      console.warn('[just-talk] failed', e);
      if (!stillCurrent('error')) return 'busy';
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
      const finished = finishJustTalkStart(startGateRef.current, attempt);
      logJustTalk('finish', { attempt, clearedGate: finished });
      if (finished) {
        setIsCallStarting(false);
      }
    }
  };

  return {
    startJustTalk,
    isCallStarting,
  };
};
