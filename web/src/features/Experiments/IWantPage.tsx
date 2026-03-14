import { SupportedLanguage } from '../Lang/lang';
import { IWantComponent } from './IWant';

export const IWantPage = ({ lang }: { lang: SupportedLanguage }) => {
  return <IWantComponent lang={lang} />;
};
