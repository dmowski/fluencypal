import { ScorePreviewSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getBackendScorePreviewSection = (lang: SupportedLanguage): ScorePreviewSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'scorePreview',
    title: i18n._('Take the Backend Readiness Test'),
    buttonTitle: i18n._('Start Test'),
    subTitle: i18n._("In less than 5 minutes, you'll get:"),
    infoList: [
      i18n._('Backend Interview Readiness Score'),
      i18n._('API design and data modeling insights'),
      i18n._('Concurrency and resiliency assessment'),
      i18n._('Action plan to improve critical backend skills'),
    ],
    scorePreview: {
      label: i18n._('Backend Readiness Score'),
      totalScore: 80,
      description: i18n._(
        'Solid knowledge of ASP.NET Core and EF Core. Some gaps in resiliency patterns and observability.',
      ),
      scoreMetrics: [
        { title: i18n._('ASP.NET Core'), score: 85 },
        { title: i18n._('Data & Transactions'), score: 82 },
        { title: i18n._('Concurrency'), score: 78 },
        { title: i18n._('Resiliency & Observability'), score: 72 },
      ],
    },
  };
};
