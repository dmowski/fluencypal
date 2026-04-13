import { WebRtcState } from './types';

export const addThreadsMessage = (message: string, state: WebRtcState) => {
  if (!state.dataChannel || state.dataChannel.readyState !== 'open') return;

  const event = {
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text: message }],
    },
  };
  state.dataChannel.send(JSON.stringify(event));
};
