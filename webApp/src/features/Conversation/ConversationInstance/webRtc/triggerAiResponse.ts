import { WebRtcState } from './types';

export const triggerAiResponse = async (state: WebRtcState) => {
  if (!state.dataChannel || state.dataChannel.readyState !== 'open') return;
  state.dataChannel.send(JSON.stringify({ type: 'response.create' }));
};
