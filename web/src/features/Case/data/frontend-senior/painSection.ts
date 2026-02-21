import { TextListSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getPainSection = (lang: SupportedLanguage): TextListSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'textList',
    title: i18n._('Even Strong Senior Developers Fail Interviews'),
    subTitle: i18n._(
      'Experience alone isn’t enough when interviews focus on reasoning, trade-offs, and communication.',
    ),
    textList: [
      {
        title: i18n._(
          'You’re asked to **design systems on the spot**, but no one tells you what “good” looks like',
        ),
        iconName: 'circle-question-mark',
        iconColor: '#c2c2c2',
      },
      {
        title: i18n._(
          'You know the tech, but **struggle to explain decisions clearly under pressure**',
        ),
        iconName: 'circle-question-mark',
        iconColor: '#c2c2c2',
      },
      {
        title: i18n._('Interviewers expect **architecture thinking**, not just clean code'),
        iconName: 'circle-question-mark',
        iconColor: '#c2c2c2',
      },
      {
        title: i18n._('Leadership and ownership questions feel **vague and subjective**'),
        iconName: 'circle-question-mark',
        iconColor: '#c2c2c2',
      },
      {
        title: i18n._(
          'You get feedback like “strong technically, but not **senior enough**” — with no specifics',
        ),
        iconName: 'circle-question-mark',
        iconColor: '#c2c2c2',
      },
      {
        title: i18n._('Salary and leveling discussions feel **awkward or one-sided**'),
        iconName: 'circle-question-mark',
        iconColor: '#c2c2c2',
      },
    ],
  };
};
