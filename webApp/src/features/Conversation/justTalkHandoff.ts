import { getUrlStart } from '@/features/Lang/getUrlStart';
import { ConversationMessage } from './conversation';

export const JUST_TALK_HANDOFF_PARAM = 'justTalk';
export const JUST_TALK_HANDOFF_VALUE = 'open';
export const ENABLE_MIC_JUST_TALK_ANALYTICS_ID = 'enable-mic-just-talk';
/** Set on quiz goalReview confirm after mic prime; consumed once on /practice. */
export const JUST_TALK_AUTO_START_KEY = 'fp_justTalkAutoStart';

export const isJustTalkHandoff = (value: string | null | undefined): boolean =>
  value === JUST_TALK_HANDOFF_VALUE || value === 'true';

/** Mark that Start Speaking already primed the mic in the same user gesture. */
export const markJustTalkAutoStart = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(JUST_TALK_AUTO_START_KEY, '1');
};

export const peekJustTalkAutoStart = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(JUST_TALK_AUTO_START_KEY) === '1';
};

/** Consume the quiz mic-prime flag (one-shot). */
export const consumeJustTalkAutoStart = (): boolean => {
  if (typeof window === 'undefined') return false;
  const marked = peekJustTalkAutoStart();
  if (marked) {
    window.sessionStorage.removeItem(JUST_TALK_AUTO_START_KEY);
  }
  return marked;
};

export const hasUserSpokenInConversation = (
  messages: Pick<ConversationMessage, 'isBot' | 'text'>[],
): boolean => messages.some((message) => !message.isBot && Boolean(message.text?.trim()));

export type PracticeIdleSurface = 'conversation' | 'handoff' | 'dashboard' | 'error' | 'loading';

export const getPracticeIdleSurface = ({
  isStarted,
  isHandoff,
  errorInitiating,
  isInitializing,
}: {
  isStarted: boolean;
  isHandoff: boolean;
  errorInitiating?: string;
  isInitializing: string;
}): PracticeIdleSurface => {
  if (isInitializing) return 'loading';
  if (errorInitiating && !isHandoff) return 'error';
  if (isStarted) return 'conversation';
  if (isHandoff) return 'handoff';
  return 'dashboard';
};

export const buildJustTalkPracticeUrl = ({
  pageLanguage,
  paymentModal = false,
}: {
  pageLanguage: string;
  paymentModal?: boolean;
}): string => {
  const params = new URLSearchParams();
  params.set(JUST_TALK_HANDOFF_PARAM, JUST_TALK_HANDOFF_VALUE);
  if (paymentModal) {
    params.set('paymentModal', 'true');
  }
  return `${getUrlStart(pageLanguage)}practice?${params.toString()}`;
};
