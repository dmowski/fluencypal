import { sleep } from '@/libs/sleep';
import { ConversationConfig } from '../types';
import { seedConversationItems } from './seedConversationItems';
import { WebRtcState } from './types';
import { updateSessionSafe } from './updateSessionSafe';

export const openHandler = async (state: WebRtcState, config: ConversationConfig) => {
  const last10 = state.lastMessages.slice(-10);
  console.log('last10', last10);
  if (last10.length > 0) {
    await seedConversationItems(last10, state);
  }

  await sleep(200);

  await updateSessionSafe({ state, config });

  if (last10.length === 0) {
    config.onOpen();
  }
};
