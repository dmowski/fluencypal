import { TechStackSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { getTechData } from './techData';

export const getTechStackSection = (lang: SupportedLanguage): TechStackSection => {
  const i18n = getI18nInstance(lang);
  const techData = getTechData(lang);

  return {
    type: 'techStack',
    title: i18n._('Tech stack covered'),
    subTitle: i18n._('Tailored practice for your framework and seniority level'),
    keyPoints: [
      i18n._('Interview questions matched to your exact tech stack'),
      i18n._('System design scenarios used by top product companies'),
      i18n._('Performance and architecture patterns for senior roles'),
      i18n._('Real-world scenarios, not just theory'),
    ],
    techGroups: [
      {
        groupTitle: i18n._('Frameworks & Libraries'),
        items: [
          techData['react-nextjs'],
          techData['vue-pinia'],
          techData['angular-rxjs'],
          techData.typescript,
        ],
      },
      {
        groupTitle: i18n._('Architecture & Design'),
        items: [
          techData['frontend-system-design'],
          techData['micro-frontends'],
          techData['state-management'],
          techData['component-libraries'],
        ],
      },
      {
        groupTitle: i18n._('Performance & Optimization'),
        items: [
          techData['rendering-performance'],
          techData['bundling-code-splitting'],
          techData['lazy-loading'],
          techData['caching-strategies'],
        ],
      },
      {
        groupTitle: i18n._('Testing & Quality'),
        items: [
          techData['jest-react-testing-library'],
          techData['cypress-e2e-testing'],
          techData['integration-testing'],
        ],
      },
      {
        groupTitle: i18n._('UX & Accessibility'),
        items: [
          techData['wcag-standards'],
          techData['semantic-html'],
          techData['performance-metrics'],
          techData['core-web-vitals'],
        ],
      },
    ],
  };
};
