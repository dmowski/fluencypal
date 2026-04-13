import { DemoSnippetSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getBackendDemoSnippetSection = (lang: SupportedLanguage): DemoSnippetSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'demoSnippet',
    title: i18n._("See the type of backend feedback you'll get"),
    subTitle: i18n._('Precise, actionable insights about APIs, data, and resiliency'),
    demoItems: [
      {
        question: i18n._('How would you improve performance for a read-heavy endpoint?'),
        userAnswerShort: i18n._("I'd add in-memory caching and increase DB resources."),
        feedback: i18n._(
          'Consider distributed caching (e.g., Redis) with appropriate TTLs to reduce DB pressure across instances. Profile the endpoint first (logging, tracing, metrics) to locate bottlenecks. Use pagination, projection (select only needed fields), and AsNoTracking for EF Core. For heavy serialization, optimize DTOs and consider compression for large payloads.',
        ),
      },
      {
        question: i18n._('How would you design a resilient external service call in .NET?'),
        userAnswerShort: i18n._("I'd add retries with a longer timeout."),
        feedback: i18n._(
          'Retries alone can amplify failures. Add exponential backoff, jitter, and a circuit breaker to prevent cascading issues. Combine with timeouts and fallback paths. Log structured context (correlation IDs) and emit metrics to observe error rates and latency.',
        ),
      },
    ],
  };
};
