import { FaqSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getFaqSection = (lang: SupportedLanguage): FaqSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'faq',
    title: i18n._('FAQ'),
    subTitle: i18n._('Your questions answered'),
    faqItems: [
      {
        question: i18n._('What types of frontend interviews can I practice for?'),
        answer: i18n._(
          'You can practice for junior frontend interviews including technical rounds, basic coding challenges, HTML/CSS fundamentals, JavaScript basics, and behavioral interviews focused on React basics, responsive design, and web development fundamentals.',
        ),
      },
      {
        question: i18n._('How does the AI feedback work?'),
        answer: i18n._(
          'Our AI evaluates your answers for technical accuracy (HTML/CSS, JavaScript basics, React fundamentals), clarity, and communication. You receive helpful suggestions on how to improve your answers and build confidence for junior-level interviews.',
        ),
      },
      {
        question: i18n._('Can I customize my practice sessions?'),
        answer: i18n._(
          "Yes. You can tailor sessions to your learning goals and the technologies you're studying (React, JavaScript, HTML/CSS). You can also focus on specific areas like DOM manipulation, responsive design, or common junior-level interview questions.",
        ),
      },
      {
        question: i18n._('Do I need to schedule time with a real interviewer?'),
        answer: i18n._(
          'No. All sessions are on-demand. You can practice anytime with AI-powered mock interviews, review feedback immediately, and repeat questions as often as you want.',
        ),
      },
    ],
  };
};
