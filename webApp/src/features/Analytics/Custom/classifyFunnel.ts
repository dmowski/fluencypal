import { AnalyticsClientEvent } from './types';

export type FunnelFlags = {
  reachedLanding: boolean;
  reachedApp: boolean;
  reachedAuth: boolean;
  reachedQuiz: boolean;
  reachedPractice: boolean;
  reachedConversation: boolean;
  reachedSpeech: boolean;
  reachedPaywall: boolean;
  reachedCheckout: boolean;
  clickedQuizCta: boolean;
  clickedSignInCta: boolean;
};

const pathLooksLikeQuiz = (path: string): boolean => {
  return /(^|\/)quiz(\/|$|\?)/i.test(path) || /[?&]quizId=/i.test(path);
};

const pathLooksLikePractice = (path: string): boolean => {
  return /(^|\/)practice(\/|$|\?)/i.test(path);
};

export const classifyFunnelFlags = (event: AnalyticsClientEvent): FunnelFlags => {
  const path = event.path;
  return {
    reachedLanding: event.sourceApp === 'landing',
    reachedApp: event.sourceApp === 'webapp',
    reachedAuth: event.name === 'identify' || Boolean(event.authUserId),
    reachedQuiz: pathLooksLikeQuiz(path),
    reachedPractice: pathLooksLikePractice(path),
    reachedConversation: event.name === 'conversation_start',
    reachedSpeech: event.name === 'speech_start' || event.name === 'conversation_start',
    reachedPaywall: event.name === 'paywall_view' || event.name === 'checkout_start',
    reachedCheckout: event.name === 'checkout_start',
    clickedQuizCta: event.sourceApp === 'landing' && event.ctaIntent === 'quiz',
    clickedSignInCta: event.sourceApp === 'landing' && event.ctaIntent === 'signin',
  };
};

export const mergeFunnelFlags = (current: FunnelFlags, next: FunnelFlags): FunnelFlags => {
  return {
    reachedLanding: current.reachedLanding || next.reachedLanding,
    reachedApp: current.reachedApp || next.reachedApp,
    reachedAuth: current.reachedAuth || next.reachedAuth,
    reachedQuiz: current.reachedQuiz || next.reachedQuiz,
    reachedPractice: current.reachedPractice || next.reachedPractice,
    reachedConversation: current.reachedConversation || next.reachedConversation,
    reachedSpeech: current.reachedSpeech || next.reachedSpeech,
    reachedPaywall: current.reachedPaywall || next.reachedPaywall,
    reachedCheckout: current.reachedCheckout || next.reachedCheckout,
    clickedQuizCta: current.clickedQuizCta || next.clickedQuizCta,
    clickedSignInCta: current.clickedSignInCta || next.clickedSignInCta,
  };
};

export const visitorFunnelFlags = (visitor: Partial<FunnelFlags>): FunnelFlags => {
  return {
    reachedLanding: Boolean(visitor.reachedLanding),
    reachedApp: Boolean(visitor.reachedApp),
    reachedAuth: Boolean(visitor.reachedAuth),
    reachedQuiz: Boolean(visitor.reachedQuiz),
    reachedPractice: Boolean(visitor.reachedPractice),
    reachedConversation: Boolean(visitor.reachedConversation),
    reachedSpeech: Boolean(visitor.reachedSpeech),
    reachedPaywall: Boolean(visitor.reachedPaywall),
    reachedCheckout: Boolean(visitor.reachedCheckout),
    clickedQuizCta: Boolean(visitor.clickedQuizCta),
    clickedSignInCta: Boolean(visitor.clickedSignInCta),
  };
};

export const lastFunnelStep = (flags: FunnelFlags): keyof FunnelFlags | 'none' => {
  if (flags.reachedCheckout) return 'reachedCheckout';
  if (flags.reachedPaywall) return 'reachedPaywall';
  if (flags.reachedConversation) return 'reachedConversation';
  if (flags.reachedPractice) return 'reachedPractice';
  if (flags.reachedQuiz) return 'reachedQuiz';
  if (flags.reachedAuth) return 'reachedAuth';
  if (flags.reachedApp) return 'reachedApp';
  if (flags.reachedLanding) return 'reachedLanding';
  return 'none';
};

export const dropOffStepLabel = (flags: FunnelFlags): string => {
  const step = lastFunnelStep(flags);
  switch (step) {
    case 'reachedCheckout':
      return 'Checkout';
    case 'reachedPaywall':
      return 'Paywall';
    case 'reachedConversation':
      return 'Spoke';
    case 'reachedPractice':
      return 'Practice page';
    case 'reachedQuiz':
      return 'Quiz';
    case 'reachedAuth':
      return 'Auth';
    case 'reachedApp':
      return 'App';
    case 'reachedLanding':
      return 'Landing';
    default:
      return 'Unknown';
  }
};
