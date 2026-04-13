import { FirstScreenSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getBackendFirstScreenSection = (lang: SupportedLanguage): FirstScreenSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'firstScreen',
    title: i18n._('Ace your C# Backend Developer interview'),
    subTitle: i18n._(
      'Practice real backend interview questions — .NET, APIs, databases, multithreading, and system design. Get your personalized interview action plan.',
    ),
    label: i18n._('C# Backend Developer'),
    buttonTitle: i18n._('Start Your Interview Test'),
  };
};
