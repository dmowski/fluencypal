import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { InterviewQuiz } from '../../types';

export const getCsharpBackendDeveloperQuizData = (lang: SupportedLanguage): InterviewQuiz => {
  const i18n = getI18nInstance(lang);

  return {
    steps: [
      {
        type: 'info',
        id: 'intro',
        title: i18n._('C# Backend Interview Readiness Test'),
        subTitle: i18n._(
          'You will answer short questions about .NET, APIs, databases, concurrency, and system design.',
        ),
        listItems: [
          { title: i18n._('.NET & ASP.NET Core'), iconName: 'code' },
          { title: i18n._('Databases & Transactions'), iconName: 'database' },
          { title: i18n._('Concurrency & Resiliency'), iconName: 'cpu' },
        ],
        buttonTitle: i18n._('Start'),
      },
      {
        type: 'record-audio',
        id: 'q-intro-yourself',
        title: i18n._('Introduce yourself as a backend engineer'),
        subTitle: i18n._('Briefly describe your experience with C#, .NET, and designing APIs.'),
        buttonTitle: i18n._('Record answer'),
      },
      {
        type: 'record-audio',
        id: 'q-aspnet-core-middleware',
        title: i18n._('Explain request handling in ASP.NET Core'),
        subTitle: i18n._(
          'Walk through middleware ordering (Authentication → Authorization → Routing → Endpoint) and why it matters.',
        ),
        listItems: [
          { title: i18n._('Routing'), iconName: 'git-branch' },
          { title: i18n._('Auth'), iconName: 'shield' },
        ],
        buttonTitle: i18n._('Record answer'),
      },
      {
        type: 'record-audio',
        id: 'q-ef-core-tracking',
        title: i18n._('EF Core tracked vs. no-tracking'),
        subTitle: i18n._('When do you use AsNoTracking and what are the trade-offs?'),
        buttonTitle: i18n._('Record answer'),
      },
      {
        type: 'analyze-inputs',
        id: 'ai-analysis-1',
        title: i18n._('Preliminary analysis of your answers'),
        subTitle: i18n._('See strengths and gaps across core backend topics.'),
        buttonTitle: i18n._('Continue'),
        aiSystemPrompt:
          "Analyze the user's backend interview answers and provide strengths, weaknesses, and suggested improvements in markdown.",
        aiResponseFormat: 'markdown',
      },
      /*{
        type: "paywall",
        id: "upgrade",
        title: i18n._("Unlock full analysis and tailored preparation"),
        subTitle: i18n._("Get detailed feedback, scripts, and practice scenarios."),
        listItems: [
          { title: i18n._("Deeper architecture feedback"), iconName: "layers" },
          { title: i18n._("API & DB scenarios"), iconName: "server" },
          { title: i18n._("Behavioral coaching"), iconName: "message-square" },
        ],
        buttonTitle: i18n._("Continue"),
      },*/
      {
        type: 'done',
        id: 'done',
        title: i18n._("You're All Set!"),
        subTitle: i18n._(
          'Thank you for completing the Senior Frontend Developer interview prep. You can now access your dashboard to start practicing. Good luck!',
        ),
        listItems: [],
        buttonTitle: i18n._('Open Dashboard'),
      },
    ],
  };
};
