import { WebRtcState } from './types';

export const toggleMute = (mute: boolean, state: WebRtcState) => {
  state.userMedia.getTracks().forEach((track) => {
    track.enabled = !mute;
  });
};
