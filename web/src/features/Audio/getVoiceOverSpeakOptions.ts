import { UserSettings } from '@/common/userSettings';
import { SpeakOptions } from './useConversationAudio';
import { languageInstructionForVoice } from '../Lang/lang';

export const getVoiceOverSpeakOptions = (userSettings?: UserSettings | null) => {
  const languageCode = userSettings?.languageCode || 'en';
  const userTargetLanguage = languageInstructionForVoice[languageCode || 'en'];

  const voiceInstruction = languageCode === 'en' || !languageCode ? '' : `${userTargetLanguage}`;

  const speakOptionsMain: SpeakOptions = {
    instructions: voiceInstruction,
    voice: 'marin',
    cache: true,
  };
  return speakOptionsMain;
};
