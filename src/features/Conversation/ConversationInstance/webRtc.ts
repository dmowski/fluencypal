'use client';
import { calculateUsagePrice, convertUsageUsdToBalanceHours, UsageEvent } from '@/common/ai';
import { sleep } from '@/libs/sleep';
import { ConversationConfig, ConversationInstance } from './types';
import { sendSdpOffer } from './webRtc/sendSdpOffer';
import { monitorWebRtcAudio } from './webRtc/monitorWebRtcAudio';
import { EventHandlers, InstructionState, WebRtcState } from './webRtc/types';
import { getAudioEl } from './webRtc/getAudioEl';
import { addThreadsMessage } from './webRtc/addThreadsMessage';
import { triggerAiResponse } from './webRtc/triggerAiResponse';
import { toggleVolume } from './webRtc/toggleVolume';
import { toggleMute } from './webRtc/toggleMute';
import { closeHandler } from './webRtc/closeHandler';
import { seedConversationItems } from './webRtc/seedConversationItems';
import { getInstruction } from './webRtc/getInstruction';
import { updateSessionSafe } from './webRtc/updateSessionSafe';
import { startWebRtc } from './webRtc/startWebRtc';
import { restartWebRtc } from './webRtc/restartWebRpc';

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

  await sleep(3000); // Important for mobile devices

  state.peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    state.audioEl.srcObject = stream;
    monitorWebRtcAudio(stream, config.setIsAiSpeaking);
  };
  state.peerConnection.addTrack(state.userMedia.getTracks()[0]);
  state.dataChannel = state.peerConnection.createDataChannel('oai-events');

  const messageHandler = (e: MessageEvent) => {
    const event = JSON.parse(e.data);
    const type = (event?.type || '') as string;
    // console.log('Event type:', type, '|', event);
    //console.log(JSON.stringify(event, null, 2));

    const previousItemId = event?.previous_item_id as string | undefined;
    const itemId = (event?.item_id || event.item?.id) as string | undefined;
    if (previousItemId && itemId) {
      config.onMessageOrder({
        [previousItemId]: itemId,
      });
    }

    if (type === 'response.done') {
      const usageId = event?.event_id || '';
      const usageEvent: UsageEvent | null = event?.response?.usage;
      if (usageEvent) {
        const priceUsd = calculateUsagePrice(usageEvent, config.model);
        const priceHours = convertUsageUsdToBalanceHours(priceUsd, config.userPricePerHourUsd);
        config.onAddUsage({
          usageId,
          usageEvent,
          priceUsd,
          priceHours,
          createdAt: Date.now(),
          model: config.model,
          languageCode: config.languageCode,
          type: 'realtime',
          conversationId: config.conversationId,
        });
      }
    }

    // conversation.item.input_audio_transcription.delta
    if (type === 'conversation.item.input_audio_transcription.delta') {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = false;
        config.onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === 'response.audio_transcript.delta') {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = true;
        config.onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === 'input_audio_buffer.speech_started') {
      config.setIsUserSpeaking(true);
    }

    if (type === 'input_audio_buffer.speech_stopped') {
      config.setIsUserSpeaking(false);
    }

    if (type === 'error') {
      console.error('Error in messageHandler', event);
    }

    if (type === 'conversation.item.input_audio_transcription.completed') {
      const userMessage = event?.transcript || '';
      if (userMessage) {
        const id = event?.item_id as string;
        config.onMessage({ isBot: false, text: userMessage, id });
        state.lastMessages.push({ isBot: false, text: userMessage });
      }
    }

    if (type === 'response.done') {
      const botAnswer = event?.response?.output
        .map((item: any) => {
          return (
            item?.content
              ?.map((content: any) => content?.transcript || content?.text || '')
              .join(' ')
              .trim() || ''
          );
        })
        .join(' ')
        .trim();

      const id = event?.response?.output?.[0]?.id as string | undefined;
      if (id && botAnswer) {
        config.onMessage({ isBot: true, text: botAnswer || '', id });
        state.lastMessages.push({ isBot: true, text: botAnswer });
      }
    }

    if (type === 'conversation.item.created') {
      if (
        event.item.role === 'user' &&
        event.item.status === 'completed' &&
        event.item.type === 'message'
      ) {
        const id = event.item.id as string;
        const content = event.item.content || [];
        const userMessage = content
          .map((item: any) => (item.type === 'input_text' ? item.text || '' : ''))
          .join(' ')
          .trim();

        if (userMessage && id) {
          config.onMessage({ isBot: false, text: userMessage, id });
          state.lastMessages.push({ isBot: false, text: userMessage });
        }
      }
    }
  };

  const closeEvent = () => {};
  const errorEvent = (e: any) => console.error('Data channel error', e);

  const updateInstruction = async (partial: Partial<InstructionState>): Promise<void> => {
    Object.assign(state.instructionState, partial);
    const updatedInstruction = getInstruction(state);
    console.log('RTC updatedInstruction:', updatedInstruction);
    await updateSessionSafe({ partialInstructionOverride: updatedInstruction, state, config });
  };

  const openHandler = async () => {
    const last10 = state.lastMessages.slice(-10);
    console.log('last10', last10);
    if (last10.length > 0) {
      await seedConversationItems(last10, state);
    }

    await sleep(200);

    await updateSessionSafe({ state, config });

    if (last10.length === 0) {
      config.onOpen();
    }
  };

  const eventHandlers: EventHandlers = {
    messageHandler,
    openHandler,
    closeEvent,
    errorEvent,
  };

  state.dataChannel.addEventListener('message', eventHandlers.messageHandler);
  state.dataChannel.addEventListener('open', eventHandlers.openHandler);
  state.dataChannel.addEventListener('close', eventHandlers.closeEvent);
  state.dataChannel.addEventListener('error', eventHandlers.errorEvent);

  const offer = await state.peerConnection.createOffer();

  await state.peerConnection.setLocalDescription(offer);
  const answer: RTCSessionDescriptionInit = {
    type: 'answer',
    sdp: await sendSdpOffer(offer, config.model, config.getAuthToken),
  };
  await state.peerConnection.setRemoteDescription(answer);

  if (config.isMuted) toggleMute(true, state);

  const sendWebCamDescription = async (description: string) => {
    const isCorrectionExistsBefore = Boolean(state.instructionState.correction);
    if (isCorrectionExistsBefore) {
      console.log('Ignoring webcam description update due to existing correction.');
      return;
    }
    updateInstruction({ webCamDescription: description });
  };

  const sendCorrectionInstruction = async (correction: string) => {
    updateInstruction({ correction });
  };

  const addUserMessageDelta = (delta: string) => {
    console.warn('addUserMessageDelta is not supported in WebRTC mode');
  };

  const completeUserMessageDelta = () => {
    console.warn('completeUserMessageDelta is not supported in WebRTC mode');
  };

  return {
    closeHandler: () => {
      closeHandler(state, {
        messageHandler,
        openHandler,
        closeEvent,
        errorEvent,
      });
    },

    addThreadsMessage: (message: string) => addThreadsMessage(message, state),
    triggerAiResponse: async () => await triggerAiResponse(state),
    toggleMute: (mute: boolean) => toggleMute(mute, state),
    toggleVolume: async (isVolumeOn: boolean) => await toggleVolume(isVolumeOn, state),

    sendWebCamDescription,
    sendCorrectionInstruction,
    addUserMessageDelta,
    completeUserMessageDelta,
    lockVolume: () => {
      console.log('lockVolume is not implemented in WebRTC mode');
    },
    unlockVolume: () => {
      console.log('unlockVolume is not implemented in WebRTC mode');
    },
    restartConversation: () => restartWebRtc(state, config, eventHandlers),
  };
};
