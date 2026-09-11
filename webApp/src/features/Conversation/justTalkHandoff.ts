import { getUrlStart } from '@/features/Lang/getUrlStart';

export const JUST_TALK_HANDOFF_PARAM = 'justTalk';
export const JUST_TALK_HANDOFF_VALUE = 'open';

export const isJustTalkHandoff = (value: string | null | undefined): boolean =>
  value === JUST_TALK_HANDOFF_VALUE || value === 'true';

export const buildJustTalkPracticeUrl = ({
  pageLanguage,
  paymentModal = false,
}: {
  pageLanguage: string;
  paymentModal?: boolean;
}): string => {
  const params = new URLSearchParams();
  params.set(JUST_TALK_HANDOFF_PARAM, JUST_TALK_HANDOFF_VALUE);
  if (paymentModal) {
    params.set('paymentModal', 'true');
  }
  return `${getUrlStart(pageLanguage)}practice?${params.toString()}`;
};
