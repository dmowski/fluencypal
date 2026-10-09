import { getAppUrlStart } from '@/features/Lang/getUrlStart';

/** Hero, Show more, and the footer. Open the English calls list. */
export const englishGroupCallOnboardingHref = (lang: string) =>
  `${getAppUrlStart(lang)}community-call`;

/** A short call with Alex. He writes back to pick a time. */
export const talkWithAlexHref = (lang: string) => `${getAppUrlStart(lang)}talk-with-alex`;

/** A tapped time skips that list and opens native language for this call. */
export const groupCallChoiceHref = (listHref: string, callId: string) => {
  const url = new URL(listHref);
  url.searchParams.set('step', 'native');
  url.searchParams.set('call', callId);
  return url.toString();
};
