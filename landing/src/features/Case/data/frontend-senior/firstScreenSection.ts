import { FirstScreenSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getFirstScreenSection = (lang: SupportedLanguage): FirstScreenSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'firstScreen',
    title: i18n._('Mock Frontend Interviews with AI to Get Senior-Level Offers'),
    subTitle: i18n._(
      'Practice real senior frontend interviews, fix critical gaps, and walk into interviews confident and prepared.',
    ),
    label: i18n._('Senior Frontend Developer'),
    buttonTitle: i18n._('Start Your Interview Test'),
  };
};
