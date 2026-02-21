import { sleep } from '@/libs/sleep';
import { closeHandler } from './closeHandler';
import { EventHandlers, WebRtcState } from './types';
import { startWebRtc } from './startWebRtc';
import { ConversationConfig } from '../types';

export const restartWebRtc = async (
  state: WebRtcState,
  config: ConversationConfig,
  eventHandlers: EventHandlers,
) => {
  if (state.restartingPromise) return state.restartingPromise;

  state.restartingPromise = (async () => {
    try {
      closeHandler(state, eventHandlers);
      await sleep(300);
      await startWebRtc(state, config, eventHandlers);
    } finally {
      state.restartingPromise = null;
    }
  })();

  return state.restartingPromise;
};
