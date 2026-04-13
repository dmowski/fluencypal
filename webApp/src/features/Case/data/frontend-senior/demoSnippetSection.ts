import { DemoSnippetSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getDemoSnippetSection = (lang: SupportedLanguage): DemoSnippetSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'demoSnippet',
    title: i18n._("See the type of feedback you'll get"),
    subTitle: i18n._('Precise, actionable insights instead of generic comments'),
    demoItems: [
      {
        question: i18n._('How would you improve the performance of a React app that feels slow?'),
        userAnswerShort: i18n._(
          'I would use React.memo and lazy loading to reduce unnecessary renders.',
        ),
        feedback: i18n._(
          "Good direction, but your answer is too shallow for a senior role. Mention measuring first (profiling with React DevTools and the browser Performance panel), then specific bottlenecks (large bundles, unnecessary network calls, expensive components). Strengthen your answer by adding concrete techniques: code splitting via dynamic imports, memoizing expensive selectors, virtualization for long lists, and leveraging browser caching and a CDN. Close with how you'd monitor improvements over time.",
        ),
      },
      {
        question: i18n._(
          'How would you design the frontend architecture for a large multi-page product?',
        ),
        userAnswerShort: i18n._(
          'I would split the app into reusable components and use a global store for state.',
        ),
        feedback: i18n._(
          "For a senior-level interview, you should go beyond 'components + global store'. Talk about module boundaries (feature-based folders, domain-driven slices), isolated design systems, clear contracts between API and UI, and how you avoid tight coupling. Mention decisions around routing, data-fetching strategy (for example React Query or SWR), error handling, and how you'd support gradual refactors or micro-frontend approaches. This shows you think like an architect, not just an implementer.",
        ),
      },
    ],
  };
};
