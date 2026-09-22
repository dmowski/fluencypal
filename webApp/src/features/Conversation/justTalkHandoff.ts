import { getUrlStart } from '@/features/Lang/getUrlStart';
import { ConversationMessage } from './conversation';
import { AiVoice } from '@/features/Ai/ai';
import { SupportedLanguage } from '@/features/Lang/lang';

export const JUST_TALK_HANDOFF_PARAM = 'justTalk';
export const JUST_TALK_HANDOFF_VALUE = 'open';
export const ENABLE_MIC_JUST_TALK_ANALYTICS_ID = 'enable-mic-just-talk';
/** Set on quiz goalReview confirm after mic prime; consumed once the call starts. */
export const JUST_TALK_AUTO_START_KEY = 'fp_justTalkAutoStart';
/** Quiz Start Speaking also puts this on the practice URL so iOS still auto-starts if sessionStorage is dropped. */
export const JUST_TALK_AUTO_START_PARAM = 'autoStart';
export const JUST_TALK_AUTO_START_PARAM_VALUE = '1';

export type JustTalkAutoStartPrefs = {
  startUnmuted: boolean;
};

export const isJustTalkHandoff = (value: string | null | undefined): boolean =>
  value === JUST_TALK_HANDOFF_VALUE || value === 'true';

const parseJustTalkAutoStart = (raw: string | null): JustTalkAutoStartPrefs | null => {
  if (!raw) return null;
  if (raw === '1') {
    return { startUnmuted: true };
  }
  try {
    const parsed = JSON.parse(raw) as { v?: number; startUnmuted?: boolean };
    if (parsed?.v === 1) {
      return { startUnmuted: parsed.startUnmuted !== false };
    }
  } catch {
    return null;
  }
  return null;
};

const readJustTalkAutoStartFromUrl = (): JustTalkAutoStartPrefs | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (!isJustTalkHandoff(params.get(JUST_TALK_HANDOFF_PARAM))) return null;
  if (params.get(JUST_TALK_AUTO_START_PARAM) !== JUST_TALK_AUTO_START_PARAM_VALUE) return null;
  return { startUnmuted: true };
};

const clearJustTalkAutoStartUrl = (): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(JUST_TALK_AUTO_START_PARAM)) return;
  url.searchParams.delete(JUST_TALK_AUTO_START_PARAM);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
};

export const readJustTalkAutoStart = (): JustTalkAutoStartPrefs | null => {
  if (typeof window === 'undefined') return null;
  return (
    readJustTalkAutoStartFromUrl() ||
    parseJustTalkAutoStart(window.sessionStorage.getItem(JUST_TALK_AUTO_START_KEY))
  );
};

/** Mark that Start Speaking already primed the mic in the same user gesture. */
export const markJustTalkAutoStart = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(
    JUST_TALK_AUTO_START_KEY,
    JSON.stringify({ v: 1, startUnmuted: true }),
  );
};

export const peekJustTalkAutoStart = (): boolean => readJustTalkAutoStart() !== null;

/** Consume the quiz mic-prime flag (one-shot after the call starts). */
export const consumeJustTalkAutoStart = (): JustTalkAutoStartPrefs | null => {
  if (typeof window === 'undefined') return null;
  const prefs = readJustTalkAutoStart();
  if (prefs) {
    window.sessionStorage.removeItem(JUST_TALK_AUTO_START_KEY);
    clearJustTalkAutoStartUrl();
  }
  return prefs;
};

export const resolveJustTalkCallSetup = ({
  prefs,
  settingsVoice,
  settingsLanguage,
}: {
  prefs: JustTalkAutoStartPrefs | null;
  settingsVoice?: AiVoice | null;
  settingsLanguage?: SupportedLanguage | null;
}): {
  voice: AiVoice;
  language: SupportedLanguage | null;
  startUnmuted: boolean;
} => ({
  voice: settingsVoice || 'shimmer',
  language: settingsLanguage || null,
  startUnmuted: Boolean(prefs?.startUnmuted),
});

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
  autoStart = false,
}: {
  pageLanguage: string;
  paymentModal?: boolean;
  autoStart?: boolean;
}): string => {
  const params = new URLSearchParams();
  params.set(JUST_TALK_HANDOFF_PARAM, JUST_TALK_HANDOFF_VALUE);
  if (autoStart) {
    params.set(JUST_TALK_AUTO_START_PARAM, JUST_TALK_AUTO_START_PARAM_VALUE);
  }
  if (paymentModal) {
    params.set('paymentModal', 'true');
  }
  return `${getUrlStart(pageLanguage)}practice?${params.toString()}`;
};
