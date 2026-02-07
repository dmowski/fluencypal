'use client';
import { ConversationConfig, ConversationInstance } from './types';
import { EventHandlers, WebRtcState } from './webRtc/types';
import { getAudioEl } from './webRtc/getAudioEl';
import { addThreadsMessage } from './webRtc/addThreadsMessage';
import { triggerAiResponse } from './webRtc/triggerAiResponse';
import { toggleVolume } from './webRtc/toggleVolume';
import { toggleMute } from './webRtc/toggleMute';
import { closeHandler } from './webRtc/closeHandler';
import { restartWebRtc } from './webRtc/restartWebRpc';
import { messageHandlerCreator } from './webRtc/messageHandler';
import { openHandler } from './webRtc/openHandler';
import { updateInstruction } from './webRtc/updateInstruction';
import { sendWebCamDescription } from './webRtc/sendWebCamDescription';
import { initConnection } from './webRtc/initConnection';

export const initWebRtcConversation = async (
  config: ConversationConfig,
): Promise<ConversationInstance> => {
  const state: WebRtcState = {
    dataChannel: null,
    peerConnection: new RTCPeerConnection(),
    userMedia: await navigator.mediaDevices.getUserMedia({
      audio: true,
    }),
    lastMessages: [],
    instructionState: {
      baseInitInstruction: config.initInstruction,
      webCamDescription: config.webCamDescription || '',
      correction: '',
    },
    currentMuted: Boolean(config.isMuted),
    currentVolumeOn: Boolean(config.isVolumeOn),
    audioEl: getAudioEl(),
    restartingPromise: null,
  };

  const eventHandlers: EventHandlers = {
    messageHandler: messageHandlerCreator(state, config),
    openHandler: () => openHandler(state, config),
    closeEvent: () => {},
    errorEvent: (e: any) => console.error('Data channel error', e),
  };

  await initConnection(state, config, eventHandlers);

  return {
    closeHandler: () => closeHandler(state, eventHandlers),
    addThreadsMessage: (message: string) => addThreadsMessage(message, state),
    triggerAiResponse: async () => await triggerAiResponse(state),
    toggleMute: (mute: boolean) => toggleMute(mute, state),
    toggleVolume: async (isVolumeOn: boolean) => await toggleVolume(isVolumeOn, state),

    sendWebCamDescription: async (description: string) => {
      sendWebCamDescription(description, state, config);
    },
    sendCorrectionInstruction: async (correction: string) => {
      updateInstruction({ correction }, state, config);
    },
    addUserMessageDelta: () => console.warn('addUserMessageDelta is not supported in WebRTC mode'),
    completeUserMessageDelta: () =>
      console.warn('completeUserMessageDelta is not supported in WebRTC mode'),
    lockVolume: () => {
      console.log('lockVolume is not implemented in WebRTC mode');
    },
    unlockVolume: () => {
      console.log('unlockVolume is not implemented in WebRTC mode');
    },
    restartConversation: () => restartWebRtc(state, config, eventHandlers),
  };
};
