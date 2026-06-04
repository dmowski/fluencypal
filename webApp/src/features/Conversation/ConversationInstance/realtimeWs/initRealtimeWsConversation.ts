'use client';

import { ConversationMessage } from '@/features/Conversation/conversation';
import { getMediaAudioStreams } from '@/features/webCam/mediaStream';
import { ConversationConfig, ConversationInstance } from '../types';
import { unlockAudioPlayback } from './audioUnlock';
import { AudioCapture, startMicCapture } from './audioCapture';
import { getMergedInstruction, InstructionState } from './instruction';
import { mapWsUsageToLog } from './mapWsUsageToLog';
import { RealtimeWsSessionClient } from './RealtimeWsSessionClient';
import { getRealtimeWsUrl } from './getRealtimeWsUrl';
import { resolveRealtimeWsAuthToken } from './resolveRealtimeWsAuthToken';

type RealtimeWsState = {
  client: RealtimeWsSessionClient;
  capture: AudioCapture | null;
  userMedia: MediaStream | null;
  instructionState: InstructionState;
  lastMessages: ConversationMessage[];
  currentMuted: boolean;
  currentVolumeOn: boolean;
  usageCounter: number;
};

export const initRealtimeWsConversation = async (
  config: ConversationConfig,
): Promise<ConversationInstance> => {
  await unlockAudioPlayback();

  const stream =
    (await getMediaAudioStreams()) ||
    (await navigator.mediaDevices.getUserMedia({
      audio: true,
    }));

  const state: RealtimeWsState = {
    client: undefined!,
    capture: null,
    userMedia: stream,
    instructionState: {
      baseInitInstruction: config.initInstruction,
      webCamDescription: config.webCamDescription || '',
      correction: '',
    },
    lastMessages: [],
    currentMuted: Boolean(config.isMuted),
    currentVolumeOn: Boolean(config.isVolumeOn),
    usageCounter: 0,
  };

  const reportAiSpeaking = () => {
    config.setIsAiSpeaking(state.client.isAssistantOutputActive);
  };

  let onOpenScheduled = false;
  const scheduleOnOpenOnce = () => {
    if (onOpenScheduled) {
      return;
    }
    onOpenScheduled = true;
    window.setTimeout(() => {
      void config.onOpen();
      if (!state.currentMuted) {
        void startCaptureIfNeeded();
      }
    }, 50);
  };

  state.client = new RealtimeWsSessionClient({
    onSessionReady: () => {
      scheduleOnOpenOnce();
    },
    onTranscriptDelta: (messageId, role, delta) => {
      config.onAddDelta(messageId, delta, role === 'assistant');
    },
    onTranscriptDone: (messageId, role, text) => {
      const message: ConversationMessage = {
        id: messageId,
        isBot: role === 'assistant',
        text,
      };
      config.onMessage(message);
      state.lastMessages.push(message);
    },
    onUsage: (payload) => {
      state.usageCounter += 1;
      const usageLog = mapWsUsageToLog({
        payload,
        usageId: `ws-usage-${state.usageCounter}`,
        languageCode: config.languageCode,
        conversationId: config.conversationId,
        userPricePerHourUsd: config.userPricePerHourUsd,
      });
      if (usageLog) {
        config.onAddUsage(usageLog);
      }
    },
    onUserSpeaking: (active) => config.setIsUserSpeaking(active),
    onAssistantSpeaking: () => reportAiSpeaking(),
    onPlaybackStateChange: () => reportAiSpeaking(),
    onError: (message) => {
      console.error('realtimeWs', message);
      const friendly = message.includes('invalid_token')
        ? 'Realtime sign-in was rejected. For Fly from localhost use pnpm dev:prod (production Firebase). For local realtime use pnpm dev with the server on port 8081.'
        : message;
      config.onTransportError?.(friendly);
    },
  });

  const client = state.client;
  client.setPlaybackVolume(state.currentVolumeOn ? 1 : 0);

  const stopCapture = () => {
    state.capture?.stop();
    state.capture = null;
  };

  const startCaptureIfNeeded = async () => {
    if (state.capture || state.currentMuted || !state.userMedia || !client.isConnected) {
      return;
    }

    await unlockAudioPlayback();
    state.capture = await startMicCapture(state.userMedia, (chunk) => {
      client.sendAudioChunk(chunk);
    });
  };

  const pushSessionInstruction = () => {
    client.updateSession({
      systemInstruction: getMergedInstruction(state.instructionState),
    });
  };

  const wsBaseUrl = getRealtimeWsUrl();
  const token = await resolveRealtimeWsAuthToken(
    (forceRefresh) => config.getAuthToken(forceRefresh),
    wsBaseUrl,
  );
  const voice = config.voice || 'shimmer';

  client.connect(token, {
    languageCode: config.languageCode,
    mode: 'RealTimeConversation',
    voiceEnabled: state.currentVolumeOn,
    micMuted: state.currentMuted,
    systemInstruction: getMergedInstruction(state.instructionState),
    voice,
    conversationId: config.conversationId,
  });

  const handlePageHide = () => {
    client.disconnect();
    stopCapture();
  };
  window.addEventListener('pagehide', handlePageHide);

  return {
    closeHandler: () => {
      window.removeEventListener('pagehide', handlePageHide);
      stopCapture();
      state.userMedia?.getTracks().forEach((track) => track.stop());
      state.userMedia = null;
      client.disconnect();
    },

    addThreadsMessage: (message: string) => {
      client.sendJson({ type: 'user.text', text: message });
      client.sendJson({ type: 'user.turn.commit' });
    },

    triggerAiResponse: async () => {
      if (!client.isConnected) {
        return;
      }
      await unlockAudioPlayback();
      client.sendJson({ type: 'assistant.trigger' });
    },

    toggleMute: (mute: boolean) => {
      state.currentMuted = mute;
      state.userMedia?.getTracks().forEach((track) => {
        track.enabled = !mute;
      });

      if (mute) {
        stopCapture();
      } else {
        void startCaptureIfNeeded();
      }

      if (client.isConnected) {
        client.updateSession({ micMuted: mute });
      }
    },

    toggleVolume: async (isVolumeOn: boolean) => {
      state.currentVolumeOn = isVolumeOn;
      client.setPlaybackVolume(isVolumeOn ? 1 : 0);
      if (!isVolumeOn) {
        client.cancelPlayback();
      }
      if (client.isConnected) {
        client.updateSession({ voiceEnabled: isVolumeOn });
      }
      reportAiSpeaking();
    },

    lockVolume: () => {
      client.setPlaybackVolume(0);
    },

    unlockVolume: () => {
      if (state.currentVolumeOn) {
        client.setPlaybackVolume(1);
      }
    },

    sendWebCamDescription: async (description: string) => {
      if (state.instructionState.correction) {
        return;
      }
      state.instructionState.webCamDescription = description;
      pushSessionInstruction();
    },

    sendCorrectionInstruction: async (correction: string) => {
      state.instructionState.correction = correction;
      client.sendJson({
        type: 'assistant.instruction',
        text: correction,
        mode: 'replace',
      });
    },

    addUserMessageDelta: () => {
      console.warn('addUserMessageDelta is not supported in realtime WebSocket mode');
    },

    completeUserMessageDelta: () => {
      console.warn('completeUserMessageDelta is not supported in realtime WebSocket mode');
    },

    restartConversation: async () => {
      stopCapture();
      client.disconnect();
      await new Promise((resolve) => window.setTimeout(resolve, 300));
      const restartToken = await resolveRealtimeWsAuthToken(
        (forceRefresh) => config.getAuthToken(forceRefresh),
        wsBaseUrl,
      );
      client.connect(restartToken, {
        languageCode: config.languageCode,
        mode: 'RealTimeConversation',
        voiceEnabled: state.currentVolumeOn,
        micMuted: state.currentMuted,
        systemInstruction: getMergedInstruction(state.instructionState),
        voice: config.voice || 'shimmer',
        conversationId: config.conversationId,
      });
      if (!state.currentMuted) {
        await startCaptureIfNeeded();
      }
    },

    flushSessionReady: scheduleOnOpenOnce,
  };
};
