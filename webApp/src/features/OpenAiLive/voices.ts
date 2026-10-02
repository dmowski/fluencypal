export type OpenAiLiveVoiceId =
  | 'marin'
  | 'gleam'
  | 'meridian'
  | 'vesper'
  | 'willow'
  | 'quartz'
  | 'ripple'
  | 'stone'
  | 'bossa'
  | 'tempo'
  | 'beacon'
  | 'delta'
  | 'cinder';

export const OPEN_AI_LIVE_DEFAULT_VOICE: OpenAiLiveVoiceId = 'marin';

export const OPEN_AI_LIVE_VOICES: readonly { id: OpenAiLiveVoiceId; name: string }[] = [
  { id: 'marin', name: 'Marin' },
  { id: 'gleam', name: 'Gleam' },
  { id: 'meridian', name: 'Meridian' },
  { id: 'vesper', name: 'Vesper' },
  { id: 'willow', name: 'Willow' },
  { id: 'stone', name: 'Stone' },
  { id: 'quartz', name: 'Quartz' },
  { id: 'ripple', name: 'Ripple' },
  { id: 'delta', name: 'Delta' },
  { id: 'cinder', name: 'Cinder' },
  { id: 'beacon', name: 'Beacon' },
  { id: 'bossa', name: 'Bossa' },
  { id: 'tempo', name: 'Tempo' },
];

const LIVE_VOICE_IDS = new Set<string>(OPEN_AI_LIVE_VOICES.map((voice) => voice.id));

export const isOpenAiLiveVoice = (value: string | null | undefined): value is OpenAiLiveVoiceId =>
  Boolean(value && LIVE_VOICE_IDS.has(value));

export const openAiLiveVoiceName = (voiceId: string | null | undefined): string =>
  OPEN_AI_LIVE_VOICES.find((voice) => voice.id === voiceId)?.name ?? 'Marin';

/** Saved app voices only overlap with Marin. Anything else starts on Marin. */
export const resolveOpenAiLiveVoice = (savedVoice: string | null | undefined): OpenAiLiveVoiceId =>
  isOpenAiLiveVoice(savedVoice) ? savedVoice : OPEN_AI_LIVE_DEFAULT_VOICE;

export const openAiLiveVoiceSampleSrc = (voiceId: OpenAiLiveVoiceId): string =>
  `/audio/open-ai-live/${voiceId}.mp3`;

const OPEN_AI_LIVE_VOICE_STORAGE_KEY = 'openAiLive.teacherVoice';

export const readStoredOpenAiLiveVoice = (): OpenAiLiveVoiceId => {
  if (typeof window === 'undefined') return OPEN_AI_LIVE_DEFAULT_VOICE;
  try {
    const stored = window.localStorage.getItem(OPEN_AI_LIVE_VOICE_STORAGE_KEY);
    return isOpenAiLiveVoice(stored) ? stored : OPEN_AI_LIVE_DEFAULT_VOICE;
  } catch {
    return OPEN_AI_LIVE_DEFAULT_VOICE;
  }
};

export const storeOpenAiLiveVoice = (voice: OpenAiLiveVoiceId) => {
  try {
    window.localStorage.setItem(OPEN_AI_LIVE_VOICE_STORAGE_KEY, voice);
  } catch {
    // Private browsing can block storage. The choice still applies to this call.
  }
};
