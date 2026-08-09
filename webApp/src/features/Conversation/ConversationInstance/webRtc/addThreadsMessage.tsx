import { ConversationConfig } from '../types';
import { WebRtcState } from './types';

export const addThreadsMessage = (
  message: string,
  state: WebRtcState,
  config: ConversationConfig,
) => {
  const text = message.trim();
  if (!text) return;

  // Optimistic local history update so record/chat UI shows the message immediately.
  // WebRTC otherwise only mirrored user text when conversation.item.created arrived
  // with status === 'completed', which the Realtime API often omits.
  const id = `user_${Date.now()}`;
  config.onMessage({ isBot: false, text, id });
  state.lastMessages.push({ isBot: false, text });

  if (!state.dataChannel || state.dataChannel.readyState !== 'open') {
    console.warn('addThreadsMessage: data channel not open; local history updated only');
    return;
  }

  state.dataChannel.send(
    JSON.stringify({
      type: 'conversation.item.create',
      item: {
        id,
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    }),
  );
};
