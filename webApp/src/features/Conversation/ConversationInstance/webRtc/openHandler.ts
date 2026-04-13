import { sleep } from '@/libs/sleep';
import { ConversationConfig } from '../types';
import { seedConversationItems } from './seedConversationItems';
import { WebRtcState } from './types';
import { updateSessionSafe } from './updateSessionSafe';

export const openHandler = async (state: WebRtcState, config: ConversationConfig) => {
  const lastMessages = state.lastMessages.slice(-15);

  console.log('lastMessages', lastMessages);

  if (lastMessages.length > 0) {
    await seedConversationItems(lastMessages, state);
  }

  await sleep(200);

  await updateSessionSafe({ state, config });

  if (lastMessages.length === 0) {
    config.onOpen();
  }
};
