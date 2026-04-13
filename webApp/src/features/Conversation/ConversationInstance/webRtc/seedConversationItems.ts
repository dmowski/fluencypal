import { buildTranscript } from './buildTranscript';
import { sendEvent } from './sendEvent';
import { SeedMsg, WebRtcState } from './types';
import { waitForDcOpen } from './waitForDcOpen';

export const seedConversationItems = async (messages: SeedMsg[], state: WebRtcState) => {
  const ok = await waitForDcOpen(5000, state);
  if (!ok) return;

  const transcript = buildTranscript(messages);
  if (!transcript) return;

  sendEvent(
    {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              `Conversation so far (most recent last):\n` +
              transcript +
              `\n\nContinue naturally from here.`,
          },
        ],
      },
    },
    state,
  );
};
