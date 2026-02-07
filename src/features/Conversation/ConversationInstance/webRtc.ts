'use client';
import { calculateUsagePrice, convertUsageUsdToBalanceHours, UsageEvent } from '@/common/ai';
import { sleep } from '@/libs/sleep';
import { ConversationConfig, ConversationInstance } from './types';
import { sendSdpOffer } from './webRtc/sendSdpOffer';
import { monitorWebRtcAudio } from './webRtc/monitorWebRtcAudio';
import { SeedMsg, WebRtcState } from './webRtc/types';
import { buildTranscript } from './webRtc/buildTranscript';
import { getAudioEl } from './webRtc/getAudioEl';

export interface InstructionState {
  baseInitInstruction: string;
  webCamDescription: string;
  correction: string;
}

export const initWebRtcConversation = async ({
  model,
  initInstruction,
  onMessage,
  onOpen,
  setIsAiSpeaking,
  setIsUserSpeaking,
  isMuted,
  onAddDelta,
  onAddUsage,
  languageCode,
  voice,
  isVolumeOn,
  getAuthToken,
  onMessageOrder,
  webCamDescription,
  conversationId,
  userPricePerHourUsd,
}: ConversationConfig): Promise<ConversationInstance> => {
  const audioEl = getAudioEl();

  let currentMuted = Boolean(isMuted);
  let currentVolumeOn = Boolean(isVolumeOn);

  const state: WebRtcState = {
    dataChannel: null,
    peerConnection: null,
    userMedia: await navigator.mediaDevices.getUserMedia({
      audio: true,
    }),
    lastMessages: [],
  };

  await sleep(2000); // Important for mobile devices

  await sleep(1000);

  state.peerConnection = new RTCPeerConnection();
  state.peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    audioEl.srcObject = stream;
    monitorWebRtcAudio(stream, setIsAiSpeaking);
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
      onMessageOrder({
        [previousItemId]: itemId,
      });
    }

    if (type === 'response.done') {
      const usageId = event?.event_id || '';
      const usageEvent: UsageEvent | null = event?.response?.usage;
      if (usageEvent) {
        const priceUsd = calculateUsagePrice(usageEvent, model);
        const priceHours = convertUsageUsdToBalanceHours(priceUsd, userPricePerHourUsd);
        onAddUsage({
          usageId,
          usageEvent,
          priceUsd,
          priceHours,
          createdAt: Date.now(),
          model,
          languageCode,
          type: 'realtime',
          conversationId,
        });
      }
    }

    // conversation.item.input_audio_transcription.delta
    if (type === 'conversation.item.input_audio_transcription.delta') {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = false;
        onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === 'response.audio_transcript.delta') {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = true;
        onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === 'input_audio_buffer.speech_started') {
      setIsUserSpeaking(true);
    }

    if (type === 'input_audio_buffer.speech_stopped') {
      setIsUserSpeaking(false);
    }

    if (type === 'error') {
      console.error('Error in messageHandler', event);
    }

    if (type === 'conversation.item.input_audio_transcription.completed') {
      const userMessage = event?.transcript || '';
      if (userMessage) {
        const id = event?.item_id as string;
        onMessage({ isBot: false, text: userMessage, id });
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
        onMessage({ isBot: true, text: botAnswer || '', id });
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
          onMessage({ isBot: false, text: userMessage, id });
          state.lastMessages.push({ isBot: false, text: userMessage });
        }
      }
    }
  };

  const closeEvent = () => {};
  const errorEvent = (e: any) => console.error('Data channel error', e);

  const instructionState: InstructionState = {
    baseInitInstruction: initInstruction,
    webCamDescription: webCamDescription || '',
    correction: '',
  };

  const getInstruction = (): string => {
    if (instructionState.correction) {
      return instructionState.correction;
    }

    return [
      instructionState.correction,
      instructionState.baseInitInstruction,
      instructionState.webCamDescription,
    ]
      .filter((part) => part && part.length > 0)
      .join('\n');
  };

  const updateInstruction = async (partial: Partial<InstructionState>): Promise<void> => {
    Object.assign(instructionState, partial);
    const updatedInstruction = getInstruction();
    console.log('RTC updatedInstruction:', updatedInstruction);
    await updateSessionSafe(updatedInstruction);
  };

  const openHandler = async () => {
    const last10 = state.lastMessages.slice(-10);
    console.log('last10', last10);
    if (last10.length > 0) {
      await seedConversationItems(last10);
    }
    await sleep(200); // you can keep 600 if you want
    await updateSessionSafe(); // send initial instruction for this NEW channel

    if (last10.length === 0) {
      onOpen();
    }
  };

  const addThreadsMessage = (message: string) => {
    if (!state.dataChannel || state.dataChannel.readyState !== 'open') return;

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: message }],
      },
    };
    state.dataChannel.send(JSON.stringify(event));
  };

  state.dataChannel.addEventListener('message', messageHandler);
  state.dataChannel.addEventListener('open', openHandler);
  state.dataChannel.addEventListener('close', closeEvent);
  state.dataChannel.addEventListener('error', errorEvent);

  const offer = await state.peerConnection.createOffer();

  await state.peerConnection.setLocalDescription(offer);
  const answer: RTCSessionDescriptionInit = {
    type: 'answer',
    sdp: await sendSdpOffer(offer, model, getAuthToken),
  };
  await state.peerConnection.setRemoteDescription(answer);

  const closeHandler = () => {
    if (state.dataChannel) {
      state.dataChannel.removeEventListener('message', messageHandler);
      state.dataChannel.removeEventListener('open', openHandler);
      state.dataChannel.removeEventListener('close', closeEvent);
      state.dataChannel.removeEventListener('error', errorEvent);

      if (state.dataChannel.readyState !== 'closed') {
        state.dataChannel.close();
        console.log('Data channel closed');
      }
    }

    if (state.peerConnection && state.peerConnection.signalingState !== 'closed') {
      state.peerConnection.getSenders().forEach((sender, index) => {
        if (sender.track) {
          sender.track.stop();
          console.log('Track stopped - #', index);
        }
      });

      state.peerConnection.close();
      console.log('Peer connection closed');
    }
  };

  const triggerAiResponse = async () => {
    if (!state.dataChannel || state.dataChannel.readyState !== 'open') return;
    state.dataChannel.send(JSON.stringify({ type: 'response.create' }));
  };

  const toggleMute = (mute: boolean) => {
    state.userMedia.getTracks().forEach((track) => {
      track.enabled = !mute;
    });
  };

  if (isMuted) toggleMute(true);

  const toggleVolume = async (isVolumeOn: boolean) => {
    if (!audioEl) return;
    audioEl.muted = !isVolumeOn;
    audioEl.volume = isVolumeOn ? 1 : 0;
  };

  const sendWebCamDescription = async (description: string) => {
    const isCorrectionExistsBefore = Boolean(instructionState.correction);
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

  let restartingPromise: Promise<void> | null = null;

  // This function creates a brand new session (mic + pc + dc + SDP exchange)
  const startWebRtc = async () => {
    await sleep(2000); // your existing mobile warmup

    state.userMedia = await navigator.mediaDevices.getUserMedia({ audio: true });
    await sleep(1000);

    state.peerConnection = new RTCPeerConnection();

    state.peerConnection.ontrack = (e) => {
      const stream = e.streams[0];
      audioEl.srcObject = stream;
      monitorWebRtcAudio(stream, setIsAiSpeaking);
    };

    state.peerConnection.addTrack(state.userMedia.getTracks()[0]);

    state.dataChannel = state.peerConnection.createDataChannel('oai-events');

    state.dataChannel.addEventListener('message', messageHandler);
    state.dataChannel.addEventListener('open', openHandler);
    state.dataChannel.addEventListener('close', closeEvent);
    state.dataChannel.addEventListener('error', errorEvent);

    const offer = await state.peerConnection.createOffer();
    await state.peerConnection.setLocalDescription(offer);

    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: await sendSdpOffer(offer, model, getAuthToken),
    };

    await state.peerConnection.setRemoteDescription(answer);

    // Reapply states after connect attempt (safe even before open)
    toggleMute(currentMuted);
    await toggleVolume(currentVolumeOn);
  };

  const updateSessionSafe = async (partialInstructionOverride?: string) => {
    if (!state.dataChannel || state.dataChannel.readyState !== 'open') return;

    const event = {
      type: 'session.update',
      session: {
        instructions: partialInstructionOverride ?? getInstruction(),
        input_audio_transcription: {
          model: 'gpt-4o-mini-transcribe',
          language: languageCode,
        },
        voice,
        modalities: currentVolumeOn ? ['audio', 'text'] : ['text'],
        turn_detection: { type: 'semantic_vad', eagerness: 'auto' },
      },
    };

    await sleep(100);
    state.dataChannel.send(JSON.stringify(event));
    await sleep(100);
  };

  const restartWebRpc = async () => {
    if (restartingPromise) return restartingPromise;

    restartingPromise = (async () => {
      try {
        closeHandler();
        await sleep(300);
        await startWebRtc();
      } finally {
        restartingPromise = null;
      }
    })();

    return restartingPromise;
  };

  const waitForDcOpen = async (timeoutMs = 5000) => {
    const startedAt = Date.now();
    while (!state.dataChannel || state.dataChannel.readyState !== 'open') {
      await sleep(50);
      if (Date.now() - startedAt > timeoutMs) return false;
    }
    return true;
  };

  const sendEvent = (event: any) => {
    if (!state.dataChannel || state.dataChannel.readyState !== 'open') return false;
    state.dataChannel.send(JSON.stringify(event));
    return true;
  };

  // You’ll pass last10Messages from your app state into initWebRtcConversation,
  // OR store them in a closure and update them via a setter.
  // For now, assume you have them available as `lastMessages`.
  const seedConversationItems = async (messages: SeedMsg[]) => {
    const ok = await waitForDcOpen();
    if (!ok) return;

    const transcript = buildTranscript(messages);
    if (!transcript) return;

    sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              `Conversation so far (most recent last):\n` +
              transcript +
              `\n\nContinue naturally from here.`,
          },
        ],
      },
    });
  };

  return {
    closeHandler,

    addThreadsMessage,
    triggerAiResponse,

    toggleMute,
    toggleVolume,

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
    restartConversation: restartWebRpc,
  };
};
