import { ExampleQuestionsSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { getTechData } from './techData';

export const getExampleQuestionsSection = (lang: SupportedLanguage): ExampleQuestionsSection => {
  const i18n = getI18nInstance(lang);
  const techData = getTechData(lang);

  return {
    type: 'exampleQuestions',
    title: i18n._('Questions you will practice'),
    subTitle: i18n._(
      "Real Junior Frontend Developer interview questions you're likely to be asked",
    ),
    questions: [
      {
        question: i18n._('What is the difference between let, const, and var in JavaScript?'),
        techItems: [techData.typescript],
      },
      {
        question: i18n._('Explain the basic concepts of React components and props.'),
        techItems: [techData['react-nextjs']],
      },
      {
        question: i18n._('How do you handle events in React?'),
        techItems: [techData['react-nextjs']],
      },
      {
        question: i18n._('What is the CSS box model and how does it work?'),
        techItems: [techData['rendering-performance']],
      },
      {
        question: i18n._('How do you fetch data from an API in a React component?'),
        techItems: [techData['react-nextjs'], techData['state-management']],
      },
      {
        question: i18n._('What are HTML semantic elements and why are they important?'),
        techItems: [techData['core-web-vitals']],
      },
      {
        question: i18n._('Explain the difference between == and === in JavaScript.'),
        techItems: [techData.typescript],
      },
      {
        question: i18n._(
          'What is Git and how do you use basic commands like commit, push, and pull?',
        ),
        techItems: [techData.typescript],
      },
    ],
  };
};
