'use client';
import {
  AiVoice,
  calculateUsagePrice,
  convertUsageUsdToBalanceHours,
  RealTimeModel,
  UsageEvent,
} from '@/common/ai';
import { sleep } from '@/libs/sleep';
import { SupportedLanguage } from '@/features/Lang/lang';
import { ConversationConfig, ConversationInstance } from './types';
import { sendSdpOffer } from './webRtc/sendSdpOffer';

type Modalities = 'audio' | 'text';

interface UpdateSessionProps {
  dataChannel: RTCDataChannel;
  initInstruction?: string;
  voice?: AiVoice;
  languageCode: SupportedLanguage;
  modalities: Modalities[];
}

const updateSession = async ({
  dataChannel,
  initInstruction,
  voice,
  languageCode,
  modalities,
}: UpdateSessionProps) => {
  if (!dataChannel) throw Error('Error on updateSession. dataChannel is not available');

  const event = {
    type: 'session.update',
    session: {
      instructions: initInstruction,
      input_audio_transcription: {
        model: 'gpt-4o-mini-transcribe',
        language: languageCode,
      },
      voice,
      modalities,

      turn_detection: {
        type: 'semantic_vad',
        eagerness: 'auto',
      },
    },
  };
  await sleep(100);
  dataChannel.send(JSON.stringify(event));
  await sleep(100);
};

const monitorWebRtcAudio = (stream: MediaStream, setIsAiSpeaking: (speaking: boolean) => void) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let lastSpeakingState = false; // Store the previous state

  const checkSpeaking = () => {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    const isSpeaking = volume > 10; // Adjust this threshold as needed

    if (isSpeaking !== lastSpeakingState) {
      setIsAiSpeaking(isSpeaking);
      lastSpeakingState = isSpeaking;
    }

    setTimeout(checkSpeaking, 100);
  };

  checkSpeaking();
};

interface InstructionState {
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
  const audioId = 'audio_for_llm';
  const existingAudio = document.getElementById(audioId) as HTMLAudioElement | null;
  let audioEl = existingAudio;
  if (!audioEl) {
    audioEl = document.createElement('audio');

    audioEl.autoplay = true;
    audioEl.id = audioId;
    document.body.appendChild(audioEl);
  }

  let currentMuted = Boolean(isMuted);
  let currentVolumeOn = Boolean(isVolumeOn);

  type SeedMsg = { isBot: boolean; text: string };

  let lastMessages: SeedMsg[] = []; // update it from outside (see below)

  await sleep(2000); // Important for mobile devices
  let userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  await sleep(1000);

  let peerConnection = new RTCPeerConnection();
  peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    audioEl.srcObject = stream;
    monitorWebRtcAudio(stream, setIsAiSpeaking);
  };
  peerConnection.addTrack(userMedia.getTracks()[0]);

  let dataChannel = peerConnection.createDataChannel('oai-events');

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
        // console.log("TIMESTAMP CHECK event", event);
        onMessage({ isBot: false, text: userMessage, id });
        // add message to localState
        lastMessages.push({ isBot: false, text: userMessage });
      }
    }

    if (type === 'response.done') {
      //console.log("event?.response?.output", event?.response?.output);
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
        // add message to localState
        lastMessages.push({ isBot: true, text: botAnswer });
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
          .map((item: any) => {
            if (item.type === 'input_text') {
              return item.text || '';
            }
            return '';
          })
          .join(' ')
          .trim();

        if (userMessage && id) {
          // console.log("TIMESTAMP CHECK event", event);
          onMessage({ isBot: false, text: userMessage, id });

          // add message to localState
          lastMessages.push({ isBot: false, text: userMessage });
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
    console.log('RTC updatedInstruction');
    console.log(updatedInstruction);

    await updateSessionSafe(updatedInstruction);
  };

  const openHandler = async () => {
    const last10 = lastMessages.slice(-10);
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
    if (!dataChannel || dataChannel.readyState !== 'open') return;

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: message }],
      },
    };
    dataChannel.send(JSON.stringify(event));
  };

  dataChannel.addEventListener('message', messageHandler);
  dataChannel.addEventListener('open', openHandler);
  dataChannel.addEventListener('close', closeEvent);
  dataChannel.addEventListener('error', errorEvent);

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);
  const answer: RTCSessionDescriptionInit = {
    type: 'answer',
    sdp: await sendSdpOffer(offer, model, getAuthToken),
  };
  await peerConnection.setRemoteDescription(answer);

  const closeHandler = () => {
    if (dataChannel) {
      dataChannel.removeEventListener('message', messageHandler);
      dataChannel.removeEventListener('open', openHandler);
      dataChannel.removeEventListener('close', closeEvent);
      dataChannel.removeEventListener('error', errorEvent);

      if (dataChannel.readyState !== 'closed') {
        dataChannel.close();
        console.log('Data channel closed');
      }
    }

    if (peerConnection && peerConnection.signalingState !== 'closed') {
      peerConnection.getSenders().forEach((sender, index) => {
        if (sender.track) {
          sender.track.stop();
          console.log('Track stopped - #', index);
        }
      });

      peerConnection.close();
      console.log('Peer connection closed');
    }
  };

  const triggerAiResponse = async () => {
    if (!dataChannel || dataChannel.readyState !== 'open') return;
    dataChannel.send(JSON.stringify({ type: 'response.create' }));
  };

  const toggleMute = (mute: boolean) => {
    userMedia.getTracks().forEach((track) => {
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
    // not supported in WebRTC mode
    console.warn('addUserMessageDelta is not supported in WebRTC mode');
  };

  const completeUserMessageDelta = () => {
    // not supported in WebRTC mode
    console.warn('completeUserMessageDelta is not supported in WebRTC mode');
  };

  let restartingPromise: Promise<void> | null = null;

  // This function creates a brand new session (mic + pc + dc + SDP exchange)
  const startWebRtc = async () => {
    await sleep(2000); // your existing mobile warmup

    userMedia = await navigator.mediaDevices.getUserMedia({ audio: true });
    await sleep(1000);

    peerConnection = new RTCPeerConnection();

    peerConnection.ontrack = (e) => {
      const stream = e.streams[0];
      audioEl.srcObject = stream;
      monitorWebRtcAudio(stream, setIsAiSpeaking);
    };

    peerConnection.addTrack(userMedia.getTracks()[0]);

    dataChannel = peerConnection.createDataChannel('oai-events');

    dataChannel.addEventListener('message', messageHandler);
    dataChannel.addEventListener('open', openHandler);
    dataChannel.addEventListener('close', closeEvent);
    dataChannel.addEventListener('error', errorEvent);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: await sendSdpOffer(offer, model, getAuthToken),
    };

    await peerConnection.setRemoteDescription(answer);

    // Reapply states after connect attempt (safe even before open)
    toggleMute(currentMuted);
    await toggleVolume(currentVolumeOn);
  };

  const updateSessionSafe = async (partialInstructionOverride?: string) => {
    if (!dataChannel || dataChannel.readyState !== 'open') return;

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
    dataChannel.send(JSON.stringify(event));
    await sleep(100);
  };

  const restartWebRpc = async () => {
    if (restartingPromise) return restartingPromise;

    restartingPromise = (async () => {
      try {
        // Close everything hard
        closeHandler();

        // Small cooldown helps prevent stuck ICE / rapid reconnect issues
        await sleep(300);

        // Start a fresh session
        await startWebRtc();

        // If you want to immediately force a session.update (even before "open"),
        // do it after a short delay; openHandler will also do it.
        //await sleep(250);
        //await updateSessionSafe();
      } finally {
        restartingPromise = null;
      }
    })();

    return restartingPromise;
  };

  const waitForDcOpen = async (timeoutMs = 5000) => {
    const startedAt = Date.now();
    while (!dataChannel || dataChannel.readyState !== 'open') {
      await sleep(50);
      if (Date.now() - startedAt > timeoutMs) return false;
    }
    return true;
  };

  const sendEvent = (event: any) => {
    if (!dataChannel || dataChannel.readyState !== 'open') return false;
    dataChannel.send(JSON.stringify(event));
    return true;
  };

  const buildTranscript = (messages: SeedMsg[]) => {
    // keep it short to avoid recreating the same cost problem
    const MAX_CHARS_PER_MSG = 800;

    return messages
      .slice(-10)
      .map((m) => {
        const who = m.isBot ? 'Assistant' : 'User';
        const text = (m.text || '').trim().slice(0, MAX_CHARS_PER_MSG);
        return `${who}: ${text}`;
      })
      .join('\n');
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
