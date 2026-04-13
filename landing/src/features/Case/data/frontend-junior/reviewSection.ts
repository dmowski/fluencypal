import { ReviewSection } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getReviewSection = (lang: SupportedLanguage): ReviewSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: 'review',
    title: i18n._('Real people. Real job offers.'),
    subTitle: i18n._('Join candidates who transformed their interview performance'),
    reviews: [
      {
        name: 'Sarah M.',
        jobTitle: 'Frontend Developer',
        rate: 5,
        review: i18n._(
          'I finally got 3 offers after months of silence. The React component challenges were exactly what I needed.',
        ),
      },
      {
        name: 'James R.',
        jobTitle: 'Senior Frontend Engineer',
        rate: 5,
        review: i18n._(
          'I was confident and clear — FluencyPal prepared me better than any coach for technical discussions about state management.',
        ),
      },
      {
        name: 'Maria L.',
        jobTitle: 'UI/UX Engineer',
        rate: 5,
        review: i18n._(
          'It helped me answer questions about accessibility and performance optimization without panic.',
        ),
      },
      {
        name: 'David K.',
        jobTitle: 'React Developer',
        rate: 4,
        review: i18n._(
          'The personalized feedback showed me exactly what I was doing wrong in my technical explanations. Game changer.',
        ),
      },
      {
        name: 'Emma T.',
        jobTitle: 'Frontend Tech Lead',
        rate: 5,
        review: i18n._(
          'Within 2 weeks I went from nervous to confident discussing architecture decisions. Got the job I wanted.',
        ),
      },
      {
        name: 'Alex P.',
        jobTitle: 'Full Stack Developer',
        rate: 5,
        review: i18n._(
          'The AI feedback on my CSS and JavaScript answers was spot-on. I improved my responses immediately.',
        ),
      },
    ],
  };
};
