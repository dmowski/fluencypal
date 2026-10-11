import { getAppUrlStart } from '@/features/Lang/getUrlStart';

/** Hero, video, and the footer. Open the group-call request form. */
export const englishGroupCallOnboardingHref = (lang: string) =>
  `${getAppUrlStart(lang)}community-call`;

/** A short call with Alex. He writes back to pick a time. */
export const talkWithAlexHref = (lang: string) => `${getAppUrlStart(lang)}talk-with-alex`;

/** A tapped time opens the same request form. The call is arranged after that. */
export const groupCallChoiceHref = (listHref: string) => listHref;
