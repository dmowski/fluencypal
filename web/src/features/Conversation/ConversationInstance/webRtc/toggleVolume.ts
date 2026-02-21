import { WebRtcState } from './types';

export const toggleVolume = async (isVolumeOn: boolean, state: WebRtcState) => {
  if (!state.audioEl) return;
  state.audioEl.muted = !isVolumeOn;
  state.audioEl.volume = isVolumeOn ? 1 : 0;
};
