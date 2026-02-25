import { SpeakOptions } from './useConversationAudio';
import { languageInstructionForVoice, SupportedLanguage } from '../Lang/lang';

export const getVoiceOverSpeakOptions = (languageCode: SupportedLanguage) => {
  const userTargetLanguage = languageInstructionForVoice[languageCode || 'en'];

  const voiceInstruction = languageCode === 'en' || !languageCode ? '' : `${userTargetLanguage}`;

  const speakOptionsMain: SpeakOptions = {
    instructions: voiceInstruction,
    voice: 'marin',
    cache: true,
  };
  return speakOptionsMain;
};
