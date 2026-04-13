import { WebRtcState } from './types';

export const sendEvent = (event: any, state: WebRtcState) => {
  if (!state.dataChannel || state.dataChannel.readyState !== 'open') return false;
  state.dataChannel.send(JSON.stringify(event));
  return true;
};
