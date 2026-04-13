import { sleep } from '@/libs/sleep';
import { ConversationConfig } from '../types';
import { EventHandlers, WebRtcState } from './types';
import { monitorWebRtcAudio } from './monitorWebRtcAudio';
import { sendSdpOffer } from './sendSdpOffer';
import { toggleMute } from './toggleMute';

export const initConnection = async (
  state: WebRtcState,
  config: ConversationConfig,
  eventHandlers: EventHandlers,
) => {
  await sleep(3000); // Important for mobile devices
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
  if (config.isMuted) toggleMute(true, state);
};
