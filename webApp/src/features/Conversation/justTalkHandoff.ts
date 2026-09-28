import { ConversationMessage } from './conversation';

export const JUST_TALK_HANDOFF_PARAM = 'justTalk';
export const JUST_TALK_HANDOFF_VALUE = 'open';

export const isJustTalkHandoff = (value: string | null | undefined): boolean =>
  value === JUST_TALK_HANDOFF_VALUE || value === 'true';

export const hasUserSpokenInConversation = (
  messages: Pick<ConversationMessage, 'isBot' | 'text'>[],
): boolean => messages.some((message) => !message.isBot && Boolean(message.text?.trim()));
