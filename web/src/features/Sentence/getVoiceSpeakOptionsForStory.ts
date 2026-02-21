import { UserSettings } from '@/common/userSettings';
import { SpeakOptions } from '../Audio/useConversationAudio';
import { fullEnglishLanguageName } from '../Lang/lang';

export const getVoiceSpeakOptionsForStory = (userSettings?: UserSettings | null) => {
  const languageCode = userSettings?.languageCode || 'en';
  const userTargetLanguage = fullEnglishLanguageName[languageCode || 'en'];

  const voiceInstruction =
    languageCode === 'en' || !languageCode ? '' : `Use a ${userTargetLanguage} language`;

  const speakOptionsMain: SpeakOptions = {
    instructions: voiceInstruction,
    voice: 'marin',
    cache: true,
  };
  return speakOptionsMain;
};
