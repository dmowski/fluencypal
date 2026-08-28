import { AnalyticsClientEvent } from './types';

export type FunnelFlags = {
  reachedLanding: boolean;
  reachedApp: boolean;
  reachedAuth: boolean;
  reachedQuiz: boolean;
  reachedPractice: boolean;
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
  };
};

export const mergeFunnelFlags = (current: FunnelFlags, next: FunnelFlags): FunnelFlags => {
  return {
    reachedLanding: current.reachedLanding || next.reachedLanding,
    reachedApp: current.reachedApp || next.reachedApp,
    reachedAuth: current.reachedAuth || next.reachedAuth,
    reachedQuiz: current.reachedQuiz || next.reachedQuiz,
    reachedPractice: current.reachedPractice || next.reachedPractice,
  };
};

export const lastFunnelStep = (flags: FunnelFlags): keyof FunnelFlags | 'none' => {
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
    case 'reachedPractice':
      return 'First conversation';
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
