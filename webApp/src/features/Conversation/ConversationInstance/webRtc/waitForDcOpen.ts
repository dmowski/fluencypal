import { sleep } from '@/libs/sleep';
import { WebRtcState } from './types';

export const waitForDcOpen = async (timeoutMs = 5000, state: WebRtcState) => {
  const startedAt = Date.now();
  while (!state.dataChannel || state.dataChannel.readyState !== 'open') {
    await sleep(50);
    if (Date.now() - startedAt > timeoutMs) return false;
  }
  return true;
};
