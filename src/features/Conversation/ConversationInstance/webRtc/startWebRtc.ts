import { sleep } from '@/libs/sleep';
import { ConversationConfig } from '../types';
import { EventHandlers, WebRtcState } from './types';
import { monitorWebRtcAudio } from './monitorWebRtcAudio';
import { sendSdpOffer } from './sendSdpOffer';
import { toggleMute } from './toggleMute';
import { toggleVolume } from './toggleVolume';

// This function creates a brand new session (mic + pc + dc + SDP exchange)
export const startWebRtc = async (
  state: WebRtcState,
  config: ConversationConfig,
  eventHandlers: EventHandlers,
) => {
  await sleep(2000); // your existing mobile warmup

  state.userMedia = await navigator.mediaDevices.getUserMedia({ audio: true });
  await sleep(1000);

  state.peerConnection = new RTCPeerConnection();

  state.peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    state.audioEl.srcObject = stream;
    monitorWebRtcAudio(stream, config.setIsAiSpeaking);
  };

  state.peerConnection.addTrack(state.userMedia.getTracks()[0]);

  state.dataChannel = state.peerConnection.createDataChannel('oai-events');

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

  // Reapply states after connect attempt (safe even before open)
  toggleMute(state.currentMuted, state);
  await toggleVolume(state.currentVolumeOn, state);
};
