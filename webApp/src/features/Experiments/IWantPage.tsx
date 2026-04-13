import { ConversationAudioProvider } from '../Audio/useConversationAudio';
import { SupportedLanguage } from '../Lang/lang';
import { IWantComponent } from './IWant';

export const IWantPage = ({ lang }: { lang: SupportedLanguage }) => {
  return (
    <ConversationAudioProvider>
      <IWantComponent lang={lang} />
    </ConversationAudioProvider>
  );
};
