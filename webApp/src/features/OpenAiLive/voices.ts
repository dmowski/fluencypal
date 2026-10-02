/**
 * GPT-Live voices are a different set from the app's saved Realtime voices.
 * Marin is the only saved voice (ash, shimmer, marin, verse) that GPT-Live accepts.
 * The other saved voices fall back to Marin.
 */
const LIVE_VOICES = new Set([
  'marin',
  'quartz',
  'ripple',
  'vesper',
  'willow',
  'stone',
  'gleam',
  'meridian',
  'bossa',
  'tempo',
  'beacon',
  'delta',
  'cinder',
]);

export const OPEN_AI_LIVE_DEFAULT_VOICE = 'marin';

export const resolveOpenAiLiveVoice = (savedVoice: string | null | undefined): string => {
  if (savedVoice && LIVE_VOICES.has(savedVoice)) return savedVoice;
  return OPEN_AI_LIVE_DEFAULT_VOICE;
};
