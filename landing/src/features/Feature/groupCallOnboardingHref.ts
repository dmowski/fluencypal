import { getAppUrlStart } from '@/features/Lang/getUrlStart';

/** English call times on the group-conversations page. Skip “I want to learn” and open the calls list. */
export const englishGroupCallOnboardingHref = (lang: string) =>
  `${getAppUrlStart(lang)}community-call?step=calls&learn=en`;
