import { speechRecognitionLanguages, SupportedLanguage } from '@/features/Lang/lang';
import { NativeLangCode } from '@/libs/language/type';

export const toSpeechLanguage = (language: NativeLangCode): string => {
  if (language in speechRecognitionLanguages) {
    return speechRecognitionLanguages[language as SupportedLanguage];
  }
  return language;
};

const scoreVoiceQuality = (voice: SpeechSynthesisVoice): number => {
  const name = voice.name.toLowerCase();
  if (name.includes('compact')) return 0;
  if (name.includes('google')) return 5;
  if (!voice.localService) return 4;
  if (name.includes('enhanced') || name.includes('premium')) return 3;
  if (name.includes('neural') || name.includes('natural')) return 3;
  return 1;
};

export const findVoicesForLanguage = (
  language: NativeLangCode,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice[] => {
  const speechLanguage = toSpeechLanguage(language).toLowerCase();
  const languagePrefix = speechLanguage.split('-')[0];

  return voices.filter((voice) => {
    const voiceLanguage = voice.lang.toLowerCase();
    return voiceLanguage === speechLanguage || voiceLanguage.startsWith(`${languagePrefix}-`);
  });
};

export const pickVoiceForLanguage = (
  language: NativeLangCode,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null => {
  const matchingVoices = findVoicesForLanguage(language, voices);
  if (matchingVoices.length === 0) {
    return null;
  }

  const rankedVoices = [...matchingVoices].sort(
    (left, right) => scoreVoiceQuality(right) - scoreVoiceQuality(left),
  );
  return rankedVoices[0] || null;
};
